-- One hash per appointment date. Each customer has one hold per date.
local action, owner, token = ARGV[1], ARGV[2], ARGV[3]
local employee, first, last = ARGV[4], tonumber(ARGV[5]), tonumber(ARGV[6])
local now = tonumber(redis.call('TIME')[1])
local entries = redis.call('HGETALL', KEYS[1])
local blocked = {}
for i = 1, #entries, 2 do
    local id = entries[i]
    local savedToken, staff, startAt, endAt, expires =
        string.match(entries[i + 1], '^([^|]+)|(%d+)|(%d+)|(%d+)|(%d+)$')
    if tonumber(expires) <= now then
        redis.call('HDEL', KEYS[1], id)
    elseif action == 'release' and id == owner and savedToken == token then
        return redis.call('HDEL', KEYS[1], id)
    elseif action == 'verify' and id == owner and savedToken == token
        and staff == employee and tonumber(startAt) == first and tonumber(endAt) == last then
        return 1
    elseif tonumber(startAt) < last and tonumber(endAt) > first then
        if action == 'acquire' and id ~= owner and staff == employee then
            return 0
        end
        if action == 'busy' and id ~= owner then
            table.insert(blocked, tonumber(staff))
        end
    end
end
if action == 'busy' then
    return blocked
end
if action ~= 'acquire' then
    return 0
end
local ttl = math.min(tonumber(ARGV[7]), tonumber(ARGV[8]) - now)
if ttl <= 0 then
    return 0
end
redis.call('HSET', KEYS[1], owner, table.concat({token, employee, ARGV[5], ARGV[6], now + ttl}, '|'))
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[7]))
return ttl
