# Retro

## Điều gì hiệu quả
- **Tách logic khỏi rendering ngay từ đầu** là quyết định quan trọng nhất. Core.js chạy headless trong Node.js mà không cần browser → test nhanh, chi phí thấp.
- **Viết scenario JSON trước khi code** giúp biết ngay output cần gì, tránh viết code rồi mới sửa format.
- **AGENTS.md ngắn gọn** đủ để agent không quên quy ước nhưng không đốt token.

## Điều gì không hiệu quả
- Lần đầu chạy test determinism bị FAIL vì tính sai số units cần di chuyển (300 ticks ≠ 5 units). Nên tính trước bằng tay trước khi ghi expected value.
- Không có CI tự động chạy test → có thể quên chạy trước commit.

## AI sai ở đâu
- Agent tính sai số units di chuyển trong test determinism (dùng 300 ticks thay vì 60 ticks cho khoảng cách 5 units). Phát hiện bằng cách chạy test và so output.
- Agent ban đầu viết `headless/run.js` dùng `require()` (CommonJS) nhưng `core.js` dùng `export` (ESM) → không chạy được. Sửa bằng cách thêm `package.json` với `"type": "module"` và viết lại runner dùng ESM.

## Harness nào giúp nhiều nhất
- **AGENTS.md** với rule "Never modify core.js to make a test pass" — ngăn agent sửa game logic để test pass.
- **headless/run-all.js** — một lệnh chạy tất cả, không cần nhớ từng scenario.

## Nếu làm lại
- Thêm Git hook chạy `node headless/run-all.js` trước mỗi commit để không bao giờ quên.
- Viết scenario đầu tiên trước cả khi tạo `core.js` để "contract-first" rõ hơn.
- Dùng TypeScript cho core.js để tránh lỗi số học ở compile time.
