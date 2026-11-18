package com.petspa.petbooking.mapper;

import com.petspa.petbooking.dto.request.NguoiDungCreationRequest;
import com.petspa.petbooking.dto.request.NguoiDungUpdateRequest;
import com.petspa.petbooking.dto.response.NguoiDungResponse;
import com.petspa.petbooking.entity.NguoiDung;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.BeanMapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface NguoidungMapper {
    @Mapping(target = "maNguoiDung", ignore = true)
    @Mapping(target = "ngayTao", ignore = true)
    @Mapping(target = "ngayCapNhat", ignore = true)
    NguoiDung toUser(NguoiDungCreationRequest request);

    @Mapping(target = "maNguoiDung", ignore = true)
    @Mapping(target = "ngayTao", ignore = true)
    @Mapping(target = "ngayCapNhat", ignore = true)
    // Bỏ qua null thay vì gán null vào (UPDATE)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUser(@MappingTarget NguoiDung user, NguoiDungUpdateRequest request);

    // Entity -> Response
    NguoiDungResponse toUserResponse(NguoiDung user);
}
