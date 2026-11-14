package com.petspa.petbooking.mapper;

import com.petspa.petbooking.dto.request.NguoiDungCreationRequest;
import com.petspa.petbooking.dto.request.NguoiDungUpdateRequest;
import com.petspa.petbooking.dto.response.NguoiDungResponse;
import com.petspa.petbooking.entity.NguoiDung;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface NguoidungMapper {
    NguoiDung toUser(NguoiDungCreationRequest request);
    void updateUser(@MappingTarget NguoiDung user, NguoiDungUpdateRequest request);
    NguoiDungResponse toUserResponse(NguoiDung user);
}
