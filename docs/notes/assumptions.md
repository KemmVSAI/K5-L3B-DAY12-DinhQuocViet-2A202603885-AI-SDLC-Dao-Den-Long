# Assumptions per Phase

## Phase 1 (PRD-0)
- PRD-0 mô tả tổng quát: game 3D góc nhìn thứ ba, gom đom đóm để thắp Đèn Lồng Lớn, nền tối/sương.
- **Giả định:** Số đom đóm = 20, số đèn lồng = 5, mỗi đèn cần 5 đom đóm. Bán kính thu = 2, bán kính thắp = 3.
- **Giả định:** Tốc độ người chơi = 5 units/s. Tick rate = 60/s.
- **Giả định:** Thắng khi tất cả đèn lồng sáng. Không có điều kiện thua ở Phase 1.
- **Giả định:** Test Contract: input JSON có `seed`, `ticks`, `inputs[]`; output JSON có `tick`, `status`, `player`, `firefliesCollected`, `lanternsLit`, v.v.
- **Tất định:** Cùng seed + cùng inputs = cùng output.

## Phase 2 (Ticket-02)
- **Giả định:** Thêm Bóng Mực (Ink Shadows) - kẻ địch tối, lang thang quanh đảo. Nếu người chơi lại gần (10 units), bóng bắt đầu đuổi theo.
- **Giả định:** Khi bóng chạm người chơi (1.5 units), HP giảm 1 (bắt đầu với 3 HP). Bóng bị stun 2s sau khi tấn công.
- **Giả định:** Thêm kỹ năng Light Burst (Space): tạo sóng sáng đẩy lùi bóng trong bán kính 8, cooldown 5s.
- **Giả định:** Thua khi HP = 0.
- Test Contract mở rộng: output thêm `shadows[]` (id, x, z, state) và `player.hp`.

## Phase 3 (Ticket-03)
- **Giả định:** Đom đóm hồi sinh sau 30s tại vị trí mới (xác định bằng seed).
- **Giả định:** Tốc độ Bóng Mực tăng 10% mỗi đèn lồng được thắp (độ khó tăng dần).
- Test cũ Phase 2 về HP không đổi, vẫn pass.

## Phase 4 (Ticket-04)
- **Giả định:** Thêm HUD hiển thị FPS và số đom đóm/đèn lồng.
- **Giả định:** Đóng gói: static web (index.html + src/), chạy bằng `npx serve .` (2 lệnh: clone + serve).
- **Giả định:** Mục tiêu hiệu năng: >= 30 FPS trên máy chấm chung.
