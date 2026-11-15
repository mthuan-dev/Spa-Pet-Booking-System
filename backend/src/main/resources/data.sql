-- Data for table `nguoidung`
-- Password: 123456

INSERT INTO nguoidung
    (manguoidung, email, hoten, matkhau, sodienthoai, nhacungcap, vaitro, trangthai, ngaytao, ngaycapnhat)
VALUES
    (1, 'admin@gmail.com', 'Trương Minh Vũ', '$2a$10$qS4k38I9p2yZEfNPRJ7NeO4ExcVxiMwwJTfe2WIN8eO3nyRQEohiO', '0902000001', 'LOCAL', 'ADMIN', 1, NOW(), NOW());

INSERT INTO nguoidung
    (manguoidung, email, hoten, matkhau, sodienthoai, nhacungcap, vaitro, trangthai, ngaytao, ngaycapnhat)
VALUES
    (2, 'user@gmail.com', 'Nguyễn Minh Thuận', '$2a$10$qS4k38I9p2yZEfNPRJ7NeO4ExcVxiMwwJTfe2WIN8eO3nyRQEohiO', '0901000001', 'LOCAL', 'CUSTOMER', 1, NOW(), NOW());
