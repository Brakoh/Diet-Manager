#!/usr/bin/env python3
import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public"
LIME = (204, 255, 0)
INK = (13, 13, 14)
D = ["11110", "10001", "10001", "10001", "10001", "10001", "11110"]
M = ["10001", "11011", "10101", "10001", "10001", "10001", "10001"]


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def write_png(path: Path, size: int, rows: list[bytes]) -> None:
    raw = bytearray()
    for row in rows:
        raw.append(0)
        raw.extend(row)
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")
    path.write_bytes(png)


def render(size: int, scale: float = 1.0) -> list[bytes]:
    px = bytearray(size * size * 4)
    for i in range(0, len(px), 4):
        px[i : i + 3] = bytes(LIME)
        px[i + 3] = 255

    def plot(x: float, y: float, radius: float) -> None:
        pad = radius + 1
        x0, x1 = max(0, int(x - pad)), min(size - 1, int(x + pad))
        y0, y1 = max(0, int(y - pad)), min(size - 1, int(y + pad))
        for yy in range(y0, y1 + 1):
            for xx in range(x0, x1 + 1):
                dist = math.hypot(xx + 0.5 - x, yy + 0.5 - y)
                alpha = max(0.0, min(1.0, radius - dist + 0.75))
                if alpha <= 0:
                    continue
                index = (yy * size + xx) * 4
                for channel in range(3):
                    px[index + channel] = int(INK[channel] * alpha + px[index + channel] * (1 - alpha))

    center = (size - 1) / 2
    radius = size * 0.33 * scale
    dot_radius = max(1.15, size * 0.015 * scale)
    for index in range(40):
        angle = -math.pi / 2 + index * 2 * math.pi / 40
        plot(center + math.cos(angle) * radius, center + math.sin(angle) * radius, dot_radius)

    cell = size * 0.032 * scale

    def glyph(bitmap: list[str], column: int) -> None:
        origin_x = center - 12 * cell / 2
        origin_y = center - 7 * cell / 2
        for row_index, row in enumerate(bitmap):
            for col_index, bit in enumerate(row):
                if bit == "1":
                    plot(
                        origin_x + (column + col_index) * cell + cell * 0.5,
                        origin_y + row_index * cell + cell * 0.5,
                        cell * 0.42,
                    )

    glyph(D, 0)
    glyph(M, 7)
    return [bytes(px[y * size * 4 : (y + 1) * size * 4]) for y in range(size)]


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    write_png(ROOT / "apple-touch-icon.png", 180, render(180))
    write_png(ROOT / "pwa-192.png", 192, render(192))
    write_png(ROOT / "pwa-512.png", 512, render(512))
    write_png(ROOT / "pwa-512-maskable.png", 512, render(512, 0.82))


if __name__ == "__main__":
    main()
