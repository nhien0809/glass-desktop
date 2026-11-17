# Nihongo Desk

Góc học tiếng Nhật JPD133 (Dekiru Nihongo bài 8–11) theo phong cách "desktop kính mờ" (glassmorphism), chuyển động bằng [GSAP](https://gsap.com/). Viết bằng HTML, CSS và JavaScript thuần.

Trang web: https://nhien0809.github.io/glass-desktop/

## Trang chủ

- Nền là ảnh phố Tokyo thật, panel kính mờ, nhân vật đứng giữa như ảnh mẫu.
- Đồng hồ chạy theo giờ thật (số lăn khi đổi).
- **今日の漢字**: ô tối nhỏ thay cho lịch. Mỗi ngày một chữ trong 41 chữ Hán: chữ to, âm Hán Việt, On · Kun, một từ ví dụ có furigana. Nút ‹ › để đổi chữ, nút con mắt để che đáp án tự kiểm tra (chạm vào phần mờ để xem). Rê chuột lên chữ để xem mẹo nhớ.
- Bốn thẻ bài 8, 9, 10, 11: bấm vào để mở sổ học lọc sẵn đúng bài.
- Trình phát nhạc: phát file nhạc từ máy của bạn (xem mục Nhạc).
- Thanh bên chỉ có icon (rê chuột để xem tên): Tra từ, Trang chủ, Chữ Hán, Bài đọc, Tranh, Luyện nói, bật/tắt nhân vật.
- Nhân vật đi lại ở mép dưới màn hình: Moka và Rin (ảnh minh hoạ bạn gửi, cắt nền trong suốt).
- Nút toàn màn hình ở thanh bên (bấm lần nữa hoặc Esc để thoát).
- Hướng dẫn từng bước tự hiện ở lần đầu vào trang chủ và Sổ học; nút **Hướng dẫn** (dấu ?) ở thanh bên để xem lại.
- Dock công cụ: Mazii, Google Dịch, Jisho, NHK News Web Easy, YouTube, Spotify, có hiệu ứng phóng to khi rê chuột.

## Luyện nói

Bấm vào nhân vật ở giữa, nút "Luyện nói", nút micro ở thanh bên, hoặc một nhân vật chibi:

1. Nhân vật đọc to một câu hỏi tiếng Nhật của bài 8–11 (có furigana; nút "Nghĩa" và "Gợi ý" để xem nghĩa và mẫu câu trả lời).
2. Bấm micro để ghi âm câu trả lời, bấm lần nữa để dừng (tối đa 20 giây).
3. Nghe lại bản ghi, xem câu bạn nói (nếu trình duyệt nhận dạng được tiếng Nhật) và nhận xét: đúng ý / gần đúng / thử lại. Bấm "Câu mẫu" để nghe câu trả lời mẫu.

Chọn bài 8, 9, 10, 11 hoặc "Tất cả" ở góc trên. Mọi thứ chạy ngay trong trình duyệt (Web Speech API + MediaRecorder): không cần máy chủ, không tải bản ghi lên đâu cả. Nhận dạng giọng nói chạy tốt nhất trên Chrome và Edge; trình duyệt khác vẫn ghi âm và nghe lại được. Máy có thể nghe nhầm (tiếng Nhật nhiều từ đồng âm), nên trang chọn cách hiểu sát câu trả lời nhất trong các phương án máy đưa ra và chấp nhận chữ đồng âm; bản ghi âm để nghe lại mới là chuẩn.

## Nhạc

- Trình phát chỉ là khung nhạc trên trang chủ: không có cửa sổ video, không quảng cáo.
- Bấm nút danh sách (≡+) rồi "Thêm nhạc từ máy" để chọn file nhạc của bạn (MP3, M4A, OGG, WAV…). Đặt tên file dạng `Ca sĩ - Tên bài.mp3` để hiện tên ca sĩ.
- File được lưu ngay trong trình duyệt của bạn (IndexedDB), không tải lên đâu cả, nên lần sau mở trang vẫn còn. Mỗi trình duyệt / mỗi máy có danh sách riêng. Bấm × để xoá bài.
- Nhạc phát tiếp đúng chỗ khi chuyển giữa trang chủ và sổ học (trang sổ học có nút nốt nhạc ở góc phải), tự tạm dừng khi mở luyện nói.
- Trang không kèm sẵn bài hát nào vì nhạc có bản quyền: hãy dùng file bạn đã mua hoặc có quyền nghe.

## Sổ học (`hoc/`)

- **Từ mới** (bài 8–11, 261 từ theo chủ đề): danh sách có cách đọc, nghĩa, thể từ điển của động từ và nút nghe đọc; che nghĩa để tự kiểm tra; đánh dấu từ đã nhớ (lưu trên máy); thẻ ghi nhớ lật được; trắc nghiệm 10 câu Nhật → Việt hoặc Việt → Nhật.
- **Ngữ pháp** (bài 8–10): mẫu câu, cách ghép, bảng chia thể từ điển / thể ない, ví dụ có furigana và nút nghe, cùng phần luyện tập chọn đáp án có giải thích ở cuối mỗi bài.
- **Học chữ Hán**: 41 thẻ chữ Hán, lọc theo bài, chế độ tự kiểm tra.
- **Bài đọc**: 11 bài đọc hiểu (mỗi bài 5 chữ Hán + 5 từ katakana), bản dịch, câu hỏi và đáp án kèm ngữ pháp. Di chuột (hoặc chạm) vào chữ Hán / katakana trong bài để xem cách đọc, âm Hán Việt, On/Kun và nghĩa.
- **Tranh kiểm tra**: nhìn tranh trả lời câu hỏi, có gợi ý và đáp án.

## Chuyển động (GSAP)

- Timeline xuất hiện lần lượt cho panel, thanh bên, widget và dock.
- Dock phóng to kiểu macOS (`gsap.quickTo` + `gsap.utils.mapRange`), thẻ nhấc lên khi rê chuột.
- Thẻ và bài đọc hiện dần khi đổi tab hoặc đổi bộ lọc; đáp án trượt ra khi mở.
- Tôn trọng `prefers-reduced-motion` bằng `gsap.matchMedia()`.

## Chạy ở máy

```bash
python -m http.server 5173
```

Rồi mở http://localhost:5173.

## Tệp

- `index.html`, `style.css`, `main.js`: trang chủ.
- `hoc/index.html`, `hoc/study.css`, `hoc/study.js`: sổ học.
- `assets/glass-ui.js`: hàm GSAP dùng chung (dock, hover).
- `assets/speak.js`: cửa sổ luyện nói (câu hỏi, giọng đọc, ghi âm, chấm).
- `assets/characters.js`: nhân vật chibi đi lại.
- `assets/music.js`: trình phát nhạc (file từ máy, lưu trong IndexedDB).
- `hoc/bai8-10-data.js`, `hoc/bai8-10.js`: từ mới và ngữ pháp bài 8–10 (lấy từ NEW WORDS LIST Dekiru Nihongo và Tổng hợp ngữ pháp JPD133).
- `assets/tour.js`: hướng dẫn từng bước (lần đầu vào trang, nút Hướng dẫn).
- `assets/hero.webp`: nhân vật ở giữa (ảnh nền trong suốt bạn gửi).
- `assets/kanji.json`: danh sách chữ Hán cho thẻ "Kanji hôm nay".

## Ghi công

- Ảnh nền: [Kate Kasiutich trên Unsplash](https://unsplash.com/photos/street-scene-with-tokyo-skytree-in-the-distance-y0h1pER2-_8) (Unsplash License).
- Nhân vật ở giữa lấy từ ảnh bạn gửi; đây là nhân vật anime có bản quyền của tác giả gốc.
- Moka và Rin (`assets/cast/`) cắt từ ảnh minh hoạ do chủ trang cung cấp; bản quyền thuộc tác giả các ảnh đó.
- Icon thương hiệu: [Simple Icons](https://simpleicons.org/) (CC0), xem `assets/icons/SIMPLE-ICONS-LICENSE.md`.
- GSAP 3, tải từ cdnjs.
