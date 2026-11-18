package com.petspa.petbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThuCungListResponse {
    private NguoiDungResponse customer;
    private List<ThuCungResponse> pets;
}
