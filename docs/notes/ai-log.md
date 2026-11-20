# AI Usage Log

## Phase 1
| Thời điểm | Công cụ | Việc | Ước tính token |
|---|---|---|---|
| 0h | Codex | Đọc 6 file docs, phân tích yêu cầu | ~3,000 input + 800 output |
| 0h10 | Codex | Thiết kế kiến trúc tách core/render | ~1,500 output |
| 0h15 | Codex | Viết `src/core.js` (game logic thuần) | ~2,200 output |
| 0h25 | Codex | Viết `src/render.js` + `src/main.js` + `index.html` | ~1,800 output |
| 0h35 | Codex | Viết `headless/run.js` + scenarios | ~800 output |
| 0h40 | Terminal | Chạy test, sửa bug determinism | ~200 output |

**Tổng Phase 1:** ~7,000 input + ~7,300 output ≈ 14,300 tokens

## Phase 2
| Thời điểm | Công cụ | Việc | Ước tính token |
|---|---|---|---|
| 1h05 | Codex | Thêm shadow logic vào core.js | ~800 output |
| 1h15 | Codex | Thêm shadow rendering + burst | ~600 output |
| 1h25 | Codex | Viết scenarios Phase 2 | ~300 output |

**Tổng Phase 2:** ~3,500 input + ~1,700 output ≈ 5,200 tokens

## Phase 3
| Thời điểm | Công cụ | Việc | Ước tính token |
|---|---|---|---|
| 2h05 | Codex | Thêm respawn + speed scale vào core.js | ~400 output |
| 2h15 | Codex | Viết scenario Phase 3 | ~200 output |

**Tổng Phase 3:** ~2,000 input + ~600 output ≈ 2,600 tokens

## Phase 4
| Thời điểm | Công cụ | Việc | Ước tính token |
|---|---|---|---|
| 2h35 | Codex | Cập nhật HUD, FPS counter | ~500 output |
| 2h45 | Terminal | Chạy test, tạo tags, Release | ~300 output |
| 2h55 | Codex | Viết README, docs, retro | ~1,200 output |

**Tổng Phase 4:** ~4,000 input + ~2,000 output ≈ 6,000 tokens

## Tổng cả bài
~16,500 input + ~11,600 output ≈ **28,100 tokens**

## Cách tiết kiệm token
- Đọc docs một lần, ghi giả định ngay, không hỏi lại agent nhiều lần.
- Viết core.js thuần trước (không DOM) → headless test không cần browser.
- Ghi AGENTS.md ngắn (~30 dòng), chỉ thêm khi agent mắc cùng lỗi 2 lần.
- Scenarios là file JSON tĩnh → không cần agent tạo lại mỗi lần chạy test.
