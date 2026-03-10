from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SPRITES = ROOT / "assets" / "sprites"
SPRITES.mkdir(parents=True, exist_ok=True)

FRAME = 40
TRANSPARENT = (0, 0, 0, 0)


def rect(draw, ox, oy, x, y, w, h, color):
    draw.rectangle((ox + x, oy + y, ox + x + w - 1, oy + y + h - 1), fill=color)


def mirror_x(x, width):
    return FRAME - x - width


def block(draw, ox, oy, x, y, w, h, color, facing=1):
    px = x if facing > 0 else mirror_x(x, w)
    rect(draw, ox, oy, px, y, w, h, color)


def draw_label(draw, ox, oy, x, y, w, h, facing=1):
    block(draw, ox, oy, x, y, w, h, "#f3f1eb", facing)
    for dx in range(1, w - 2, 4):
        block(draw, ox, oy, x + dx, y + 1, 2, h - 2, "#35516a", facing)


def draw_nelson(draw, ox, oy, pose, facing=1, source_variant=False):
    skin = "#d9c1a5"
    skin_shadow = "#b48a6b"
    outline = "#17110f"
    hair = "#a5a19b"
    glasses = "#26201d"
    mouth = "#8d5a46"
    helmet = "#2b5d92" if not source_variant else "#56695f"
    helmet_shadow = "#17395e" if not source_variant else "#364238"
    helmet_hi = "#70a2cf" if not source_variant else "#8eab97"
    vest = "#6c95b7" if not source_variant else "#8da193"
    vest_shadow = "#3d5872" if not source_variant else "#5b6b63"
    vest_hi = "#aac3d3" if not source_variant else "#c1d0c6"
    scarf = "#7f362f" if not source_variant else "#6d5648"
    pants = "#45484f"
    boots = "#16110f"
    mic_body = "#120d0c"
    mic_flag = "#d24d3f"
    mic_logo = "#f7d554"

    body_shift = pose.get("body_shift", 0)
    head_shift = pose.get("head_shift", 0)
    front_arm_y = pose.get("front_arm_y", 20)
    front_arm_x = pose.get("front_arm_x", 26)
    back_arm_y = pose.get("back_arm_y", 21)
    back_arm_x = pose.get("back_arm_x", 8)
    mic_y = pose.get("mic_y", 21)
    mic_x = pose.get("mic_x", 31)
    mic_len = pose.get("mic_len", 5)
    lean = pose.get("lean", 0)
    front_leg = pose.get("front_leg", 0)
    back_leg = pose.get("back_leg", 0)
    crouch = pose.get("crouch", 0)
    extend_arm = pose.get("extend_arm", False)
    interview = pose.get("interview", False)
    no_mic = pose.get("no_mic", False)
    blink = pose.get("blink", False)
    talk = pose.get("talk", False)

    base_y = oy + body_shift + crouch
    head_y = base_y + head_shift

    block(draw, ox, head_y, 9 + lean, 2, 20, 1, outline, facing)
    block(draw, ox, head_y, 10 + lean, 3, 18, 6, helmet, facing)
    block(draw, ox, head_y, 12 + lean, 4, 12, 2, helmet_hi, facing)
    block(draw, ox, head_y, 11 + lean, 8, 15, 1, helmet_shadow, facing)
    block(draw, ox, head_y, 15 + lean, 3, 4, 2, "#ee7d38", facing)
    block(draw, ox, head_y, 19 + lean, 3, 1, 4, "#ee7d38", facing)
    block(draw, ox, head_y, 21 + lean, 3, 4, 1, "#f0f4ff", facing)
    block(draw, ox, head_y, 23 + lean, 4, 1, 3, "#f0f4ff", facing)

    block(draw, ox, head_y, 11 + lean, 9, 16, 9, skin, facing)
    block(draw, ox, head_y, 10 + lean, 10, 2, 6, hair, facing)
    block(draw, ox, head_y, 25 + lean, 10, 2, 6, hair, facing)
    block(draw, ox, head_y, 12 + lean, 11, 12, 2, glasses if not blink else "#463a34", facing)
    block(draw, ox, head_y, 18 + lean, 12, 2, 4, skin_shadow, facing)
    block(draw, ox, head_y, 16 + lean, 16, 4, 1, mouth if talk else "#6d4437", facing)
    block(draw, ox, head_y, 12 + lean, 18, 14, 2, scarf, facing)

    torso_y = base_y + 18
    block(draw, ox, torso_y, 10 + lean, 0, 18, 14, vest, facing)
    block(draw, ox, torso_y, 10 + lean, 8, 18, 6, vest_shadow, facing)
    block(draw, ox, torso_y, 13 + lean, 2, 12, 3, vest_hi, facing)
    draw_label(draw, ox, torso_y, 13 + lean, 5, 12, 3, facing)
    block(draw, ox, torso_y, 16 + lean, 9, 6, 4, "#f0f0f0", facing)
    block(draw, ox, torso_y, 12 + lean, 13, 4, 2, outline, facing)
    block(draw, ox, torso_y, 21 + lean, 13, 4, 2, outline, facing)

    block(draw, ox, base_y, back_arm_x + lean, back_arm_y, 4, 9, skin, facing)
    block(draw, ox, base_y, back_arm_x - 1 + lean, back_arm_y + 8, 5, 4, vest_shadow, facing)

    arm_width = 5 if extend_arm else 4
    block(draw, ox, base_y, front_arm_x + lean, front_arm_y, arm_width, 9, skin, facing)
    block(draw, ox, base_y, front_arm_x - 1 + lean, front_arm_y + 8, arm_width + 1, 4, vest_shadow, facing)

    if not no_mic:
        block(draw, ox, base_y, mic_x + lean, mic_y, mic_len, 2, mic_body, facing)
        block(draw, ox, base_y, mic_x + mic_len - 1 + lean, mic_y - 1, 4, 4, mic_flag, facing)
        block(draw, ox, base_y, mic_x + mic_len + 1 + lean, mic_y, 1, 2, mic_logo, facing)

    if interview:
        block(draw, ox, base_y, 29 + lean, 16, 1, 12, "#dfd8cb", facing)
        block(draw, ox, base_y, 30 + lean, 17, 4, 3, "#cbb79f", facing)

    leg_y = base_y + 33
    block(draw, ox, leg_y, 13 + lean, 0 + back_leg, 5, 7 - back_leg, pants, facing)
    block(draw, ox, leg_y, 21 + lean, 0 + front_leg, 5, 7 - front_leg, pants, facing)
    block(draw, ox, leg_y, 12 + lean, 7, 7, 2, boots, facing)
    block(draw, ox, leg_y, 20 + lean, 7, 7, 2, boots, facing)


def draw_enemy_rifle(draw, ox, oy, pose, facing=1):
    body = "#8a4638"
    body_dark = "#532820"
    armor = "#403633"
    skin = "#d0b293"
    gun = "#1a1311"
    outline = "#140f0d"
    leg_shift = pose.get("leg_shift", 0)
    body_shift = pose.get("body_shift", 0)
    lean = pose.get("lean", 0)
    shooting = pose.get("shooting", False)

    block(draw, ox, oy + body_shift, 11 + lean, 4, 18, 2, outline, facing)
    block(draw, ox, oy + body_shift, 12 + lean, 5, 16, 6, "#6e6158", facing)
    block(draw, ox, oy + body_shift, 14 + lean, 7, 10, 4, skin, facing)
    block(draw, ox, oy + body_shift, 14 + lean, 8, 10, 2, "#2a2321", facing)
    block(draw, ox, oy + body_shift, 11 + lean, 11, 18, 14, armor, facing)
    block(draw, ox, oy + body_shift, 13 + lean, 13, 14, 6, body, facing)
    block(draw, ox, oy + body_shift, 14 + lean, 24, 5, 8 - leg_shift, body_dark, facing)
    block(draw, ox, oy + body_shift, 21 + lean, 24, 5, 8 + leg_shift, body_dark, facing)
    block(draw, ox, oy + body_shift, 13 + lean, 32, 7, 2, gun, facing)
    block(draw, ox, oy + body_shift, 20 + lean, 32, 7, 2, gun, facing)
    block(draw, ox, oy + body_shift, 8 + lean, 16, 4, 10, skin, facing)
    block(draw, ox, oy + body_shift, 7 + lean, 24, 5, 3, body_dark, facing)
    arm_x = 25 if shooting else 23
    block(draw, ox, oy + body_shift, arm_x + lean, 16, 4, 9, skin, facing)
    block(draw, ox, oy + body_shift, arm_x + 3 + lean, 18, 8, 2, gun, facing)
    block(draw, ox, oy + body_shift, arm_x + 10 + lean, 17, 5, 4, gun, facing)


def draw_enemy_heavy(draw, ox, oy, pose, facing=1):
    armor = "#6f4035"
    armor_dark = "#41231d"
    metal = "#3a3635"
    skin = "#c8a885"
    gun = "#17120f"
    leg_shift = pose.get("leg_shift", 0)
    body_shift = pose.get("body_shift", 0)
    shooting = pose.get("shooting", False)

    block(draw, ox, oy + body_shift, 9, 4, 22, 3, metal, facing)
    block(draw, ox, oy + body_shift, 11, 7, 18, 7, "#756b64", facing)
    block(draw, ox, oy + body_shift, 13, 8, 12, 5, skin, facing)
    block(draw, ox, oy + body_shift, 12, 10, 13, 2, "#2a211d", facing)
    block(draw, ox, oy + body_shift, 8, 14, 24, 16, metal, facing)
    block(draw, ox, oy + body_shift, 11, 16, 18, 8, armor, facing)
    block(draw, ox, oy + body_shift, 13, 30, 6, 8 - leg_shift, armor_dark, facing)
    block(draw, ox, oy + body_shift, 21, 30, 6, 8 + leg_shift, armor_dark, facing)
    block(draw, ox, oy + body_shift, 12, 37, 8, 2, gun, facing)
    block(draw, ox, oy + body_shift, 20, 37, 8, 2, gun, facing)
    block(draw, ox, oy + body_shift, 7, 19, 5, 11, skin, facing)
    block(draw, ox, oy + body_shift, 6, 28, 6, 4, armor_dark, facing)
    arm_x = 26 if shooting else 24
    block(draw, ox, oy + body_shift, arm_x, 18, 5, 10, skin, facing)
    block(draw, ox, oy + body_shift, arm_x + 4, 20, 11, 3, gun, facing)
    block(draw, ox, oy + body_shift, arm_x + 13, 19, 5, 6, gun, facing)


def draw_drone(draw, ox, oy, frame):
    bob = frame % 2
    rect(draw, ox, oy + bob, 7, 13, 18, 4, "#594a41")
    rect(draw, ox, oy + bob, 4, 17, 24, 6, "#7d6552")
    rect(draw, ox, oy + bob, 11, 22, 10, 4, "#4a4038")
    rect(draw, ox, oy + bob, 9, 14, 14, 2, "#d8a664")
    rect(draw, ox, oy + bob, 1, 11, 6, 2, "#95816b")
    rect(draw, ox, oy + bob, 25, 11, 6, 2, "#95816b")
    rect(draw, ox, oy + bob, 3, 10, 2, 6, "#b9a58d")
    rect(draw, ox, oy + bob, 27, 10, 2, 6, "#b9a58d")


def draw_effect(draw, ox, oy, frame):
    if frame < 4:
        size = 4 + frame * 3
        rect(draw, ox, oy, 20 - size // 2, 20 - size // 2, size, size, "#f8d37a")
        rect(draw, ox, oy, 20 - size // 2 + 1, 20 - size // 2 + 1, size - 2, size - 2, "#ee8d4e")
    else:
        idx = frame - 4
        size = 8 + idx * 4
        rect(draw, ox, oy, 20 - size // 2, 18 - size // 2, size, size, "#e4a24b")
        rect(draw, ox, oy, 20 - (size - 4) // 2, 18 - (size - 4) // 2, size - 4, size - 4, "#c44f35")
        if size > 8:
            rect(draw, ox, oy, 20 - (size - 8) // 2, 18 - (size - 8) // 2, size - 8, size - 8, "#4f241d")


def tile(draw, tx, ty, fill, accent, shadow):
    rect(draw, tx, ty, 0, 0, 32, 32, fill)
    for y in range(0, 32, 8):
        rect(draw, tx, ty, 0, y, 32, 1, accent)
    for x in range(0, 32, 8):
        rect(draw, tx, ty, x, 0, 1, 32, accent)
    rect(draw, tx, ty, 0, 30, 32, 2, shadow)


def draw_tiles():
    sheet = Image.new("RGBA", (32 * 8, 32 * 2), TRANSPARENT)
    draw = ImageDraw.Draw(sheet)
    palettes = [
        ("#6f5a49", "#8a7158", "#443429"),
        ("#514845", "#746962", "#2e2825"),
        ("#5f6752", "#8a9779", "#394032"),
        ("#4d5660", "#7d8891", "#2a3036"),
        ("#7a674f", "#af9364", "#453725"),
        ("#504742", "#786b63", "#28221d"),
        ("#6a5043", "#9c775c", "#3b2a20"),
        ("#44515d", "#71808d", "#262d33"),
    ]
    for index, palette in enumerate(palettes):
        tile(draw, (index % 8) * 32, (index // 8) * 32, *palette)
        tx = (index % 8) * 32
        ty = (index // 8) * 32
        rect(draw, tx, ty, 4, 4, 24, 4, palette[1])
        rect(draw, tx, ty, 6, 10, 20, 3, palette[2])
        rect(draw, tx, ty, 3, 19, 5, 5, palette[1])
        rect(draw, tx, ty, 22, 17, 6, 8, palette[2])
    sheet.save(SPRITES / "tiles_sheet.png")


def draw_props():
    sheet = Image.new("RGBA", (32 * 8, 32 * 2), TRANSPARENT)
    draw = ImageDraw.Draw(sheet)

    # crate
    rect(draw, 0, 0, 6, 10, 20, 16, "#7a5c42")
    rect(draw, 0, 0, 6, 10, 20, 2, "#b58a63")
    rect(draw, 0, 0, 8, 14, 16, 2, "#4c3526")
    rect(draw, 0, 0, 15, 10, 2, 16, "#4c3526")

    # sandbag
    ox = 32
    rect(draw, ox, 0, 3, 16, 24, 10, "#9a8b6e")
    rect(draw, ox, 0, 1, 20, 28, 7, "#b5a07f")
    rect(draw, ox, 0, 9, 18, 4, 4, "#6f5f46")
    rect(draw, ox, 0, 18, 18, 4, 4, "#6f5f46")

    # barrel
    ox = 64
    rect(draw, ox, 0, 10, 8, 12, 18, "#74453a")
    rect(draw, ox, 0, 10, 10, 12, 3, "#b96d57")
    rect(draw, ox, 0, 10, 20, 12, 3, "#5b2f27")
    rect(draw, ox, 0, 9, 7, 14, 2, "#d9c07e")

    # dish
    ox = 96
    rect(draw, ox, 0, 7, 6, 18, 3, "#beb7ad")
    rect(draw, ox, 0, 5, 9, 22, 9, "#706d6a")
    rect(draw, ox, 0, 14, 18, 4, 10, "#8d867a")
    rect(draw, ox, 0, 15, 28, 2, 4, "#403b36")

    # antenna
    ox = 128
    rect(draw, ox, 0, 15, 4, 2, 22, "#c7c0b6")
    rect(draw, ox, 0, 9, 12, 14, 2, "#8d867a")
    rect(draw, ox, 0, 6, 26, 20, 3, "#4d4540")
    rect(draw, ox, 0, 13, 2, 6, 2, "#ef7b4d")

    # medical lamp
    ox = 160
    rect(draw, ox, 0, 8, 22, 16, 5, "#4d4b47")
    rect(draw, ox, 0, 15, 6, 2, 20, "#cfc6bc")
    rect(draw, ox, 0, 9, 6, 14, 4, "#cfc6bc")
    rect(draw, ox, 0, 10, 7, 12, 2, "#e7d27b")

    # wreck panel
    ox = 192
    rect(draw, ox, 0, 4, 10, 24, 14, "#5f5b56")
    rect(draw, ox, 0, 4, 10, 24, 2, "#9a9388")
    rect(draw, ox, 0, 9, 15, 14, 2, "#c65d41")
    rect(draw, ox, 0, 16, 11, 3, 12, "#3a342f")

    # camera case
    ox = 224
    rect(draw, ox, 0, 6, 14, 20, 12, "#3c3530")
    rect(draw, ox, 0, 6, 14, 20, 2, "#655c54")
    rect(draw, ox, 0, 12, 10, 8, 4, "#2b2521")
    rect(draw, ox, 0, 14, 18, 4, 3, "#d5cab9")

    # road sign
    oy = 32
    rect(draw, 0, oy, 14, 8, 4, 20, "#d3cdc2")
    rect(draw, 0, oy, 5, 8, 22, 10, "#9c8265")
    rect(draw, 0, oy, 7, 10, 18, 2, "#f0de9b")

    # armored van
    ox = 32
    rect(draw, ox, oy, 4, 12, 24, 10, "#4e5c66")
    rect(draw, ox, oy, 8, 8, 14, 6, "#687985")
    rect(draw, ox, oy, 7, 20, 6, 6, "#201d1a")
    rect(draw, ox, oy, 19, 20, 6, 6, "#201d1a")
    rect(draw, ox, oy, 12, 14, 8, 3, "#d1dce5")

    # rooftop generator
    ox = 64
    rect(draw, ox, oy, 6, 12, 20, 14, "#5c5248")
    rect(draw, ox, oy, 8, 14, 16, 4, "#847663")
    rect(draw, ox, oy, 10, 19, 12, 2, "#302823")
    rect(draw, ox, oy, 18, 6, 3, 6, "#b48b48")

    # spotlight
    ox = 96
    rect(draw, ox, oy, 14, 10, 4, 18, "#4e4a45")
    rect(draw, ox, oy, 9, 9, 14, 7, "#b0a999")
    rect(draw, ox, oy, 7, 11, 18, 3, "#f0dd9b")

    # monitor rack
    ox = 128
    rect(draw, ox, oy, 6, 8, 20, 18, "#2f3438")
    rect(draw, ox, oy, 8, 10, 16, 12, "#6b7b85")
    rect(draw, ox, oy, 10, 12, 5, 4, "#d89a56")
    rect(draw, ox, oy, 17, 12, 5, 4, "#7ed0b0")

    # uplink mast
    ox = 160
    rect(draw, ox, oy, 14, 3, 4, 22, "#ccc5b8")
    rect(draw, ox, oy, 9, 8, 14, 2, "#898073")
    rect(draw, ox, oy, 12, 24, 10, 4, "#4f4840")

    # rubble pile
    ox = 192
    rect(draw, ox, oy, 3, 20, 24, 7, "#605247")
    rect(draw, ox, oy, 6, 17, 8, 5, "#887261")
    rect(draw, ox, oy, 14, 15, 9, 6, "#7a6657")
    rect(draw, ox, oy, 17, 13, 4, 4, "#c55d42")

    # satellite truck
    ox = 224
    rect(draw, ox, oy, 3, 15, 25, 9, "#5d685f")
    rect(draw, ox, oy, 8, 10, 12, 5, "#7f9087")
    rect(draw, ox, oy, 6, 22, 6, 6, "#1d1a18")
    rect(draw, ox, oy, 19, 22, 6, 6, "#1d1a18")
    rect(draw, ox, oy, 18, 6, 8, 2, "#d1cdc2")
    rect(draw, ox, oy, 24, 4, 2, 8, "#d1cdc2")

    sheet.save(SPRITES / "props_sheet.png")


def make_sheet(path, frames, draw_fn, cols=6, frame_size=FRAME):
    rows = (len(frames) + cols - 1) // cols
    image = Image.new("RGBA", (cols * frame_size, rows * frame_size), TRANSPARENT)
    draw = ImageDraw.Draw(image)
    for index, pose in enumerate(frames):
        ox = (index % cols) * frame_size
        oy = (index // cols) * frame_size
        draw_fn(draw, ox, oy, pose)
    image.save(path)


def main():
    nelson_frames = [
        {"body_shift": 0, "front_leg": 0, "back_leg": 1, "front_arm_y": 20, "mic_y": 21},
        {"body_shift": 1, "front_leg": 1, "back_leg": 0, "front_arm_y": 21, "mic_y": 22, "blink": True},
        {"body_shift": 0, "front_leg": 0, "back_leg": 1, "front_arm_y": 20, "mic_y": 21},
        {"body_shift": 1, "front_leg": 1, "back_leg": 0, "front_arm_y": 21, "mic_y": 22, "talk": True},
        {"lean": 1, "front_leg": 3, "back_leg": 0, "front_arm_y": 19, "back_arm_y": 23, "mic_y": 18},
        {"lean": 1, "front_leg": 1, "back_leg": 2, "front_arm_y": 20, "back_arm_y": 22, "mic_y": 19},
        {"lean": 0, "front_leg": 0, "back_leg": 3, "front_arm_y": 21, "back_arm_y": 21, "mic_y": 20},
        {"lean": -1, "front_leg": 2, "back_leg": 1, "front_arm_y": 20, "back_arm_y": 20, "mic_y": 19},
        {"lean": -1, "front_leg": 3, "back_leg": 0, "front_arm_y": 19, "back_arm_y": 23, "mic_y": 18},
        {"lean": 0, "front_leg": 1, "back_leg": 2, "front_arm_y": 20, "back_arm_y": 21, "mic_y": 19},
        {"body_shift": -2, "front_leg": 3, "back_leg": 2, "front_arm_y": 18, "back_arm_y": 19, "mic_y": 17},
        {"body_shift": -1, "front_leg": 4, "back_leg": 1, "front_arm_y": 17, "back_arm_y": 20, "mic_y": 16, "talk": True},
        {"lean": 2, "front_arm_x": 27, "front_arm_y": 16, "back_arm_y": 22, "mic_x": 33, "mic_y": 17, "mic_len": 7, "extend_arm": True},
        {"lean": 1, "front_arm_x": 27, "front_arm_y": 17, "back_arm_y": 22, "mic_x": 33, "mic_y": 18, "mic_len": 7, "extend_arm": True},
        {"lean": 0, "front_arm_x": 27, "front_arm_y": 16, "back_arm_y": 22, "mic_x": 33, "mic_y": 17, "mic_len": 7, "extend_arm": True},
        {"body_shift": 0, "front_arm_x": 26, "front_arm_y": 18, "back_arm_x": 9, "back_arm_y": 22, "mic_x": 30, "mic_y": 16, "mic_len": 5, "interview": True, "talk": True},
        {"body_shift": 1, "front_arm_x": 26, "front_arm_y": 19, "back_arm_x": 9, "back_arm_y": 22, "mic_x": 31, "mic_y": 17, "mic_len": 5, "interview": True},
        {"body_shift": 0, "front_arm_x": 26, "front_arm_y": 18, "back_arm_x": 9, "back_arm_y": 22, "mic_x": 30, "mic_y": 16, "mic_len": 5, "interview": True, "talk": True},
        {"body_shift": 1, "front_arm_x": 26, "front_arm_y": 19, "back_arm_x": 9, "back_arm_y": 22, "mic_x": 31, "mic_y": 17, "mic_len": 5, "interview": True},
        {"body_shift": 1, "front_arm_y": 22, "back_arm_y": 20, "mic_y": 23, "talk": True},
        {"body_shift": 2, "front_arm_y": 23, "back_arm_y": 21, "mic_y": 24, "blink": True},
    ]

    source_frames = [
        {"no_mic": True, "body_shift": 0, "front_leg": 0, "back_leg": 1},
        {"no_mic": True, "body_shift": 1, "front_leg": 1, "back_leg": 0, "blink": True},
        {"no_mic": True, "body_shift": 0, "front_leg": 0, "back_leg": 1},
        {"no_mic": True, "body_shift": 1, "front_leg": 1, "back_leg": 0, "talk": True},
        {"no_mic": True, "body_shift": 0, "front_arm_y": 18, "back_arm_y": 22, "talk": True, "interview": True},
        {"no_mic": True, "body_shift": 1, "front_arm_y": 19, "back_arm_y": 22, "interview": True},
        {"no_mic": True, "body_shift": 0, "front_arm_y": 18, "back_arm_y": 22, "interview": True, "talk": True},
        {"no_mic": True, "body_shift": 1, "front_arm_y": 19, "back_arm_y": 22, "interview": True},
        {"no_mic": True, "body_shift": -1, "front_leg": 2, "back_leg": 3, "front_arm_y": 18},
        {"no_mic": True, "body_shift": -2, "front_leg": 3, "back_leg": 2, "front_arm_y": 17},
        {"no_mic": True, "body_shift": 0, "front_arm_x": 25, "front_arm_y": 16, "back_arm_y": 20, "interview": True},
        {"no_mic": True, "body_shift": 1, "front_arm_x": 25, "front_arm_y": 17, "back_arm_y": 20, "interview": True},
    ]

    rifle_frames = [
        {"body_shift": 0},
        {"body_shift": 1},
        {"body_shift": 0, "leg_shift": 2},
        {"body_shift": 0, "leg_shift": -1, "lean": 1},
        {"body_shift": 1, "leg_shift": 1, "lean": 0},
        {"body_shift": 0, "leg_shift": -2, "lean": -1},
        {"body_shift": 0, "shooting": True, "lean": 1},
        {"body_shift": 1, "shooting": True, "lean": 0},
    ]

    heavy_frames = [
        {"body_shift": 0},
        {"body_shift": 1},
        {"body_shift": 0, "leg_shift": 2},
        {"body_shift": 0, "leg_shift": -1},
        {"body_shift": 1, "leg_shift": 1},
        {"body_shift": 0, "leg_shift": -2},
        {"body_shift": 0, "shooting": True},
        {"body_shift": 1, "shooting": True},
    ]

    make_sheet(SPRITES / "nelson_sheet.png", nelson_frames, lambda draw, ox, oy, pose: draw_nelson(draw, ox, oy, pose))
    make_sheet(SPRITES / "source_sheet.png", source_frames, lambda draw, ox, oy, pose: draw_nelson(draw, ox, oy, pose, source_variant=True), cols=4)
    make_sheet(SPRITES / "enemy_rifle_sheet.png", rifle_frames, draw_enemy_rifle, cols=4)
    make_sheet(SPRITES / "enemy_heavy_sheet.png", heavy_frames, draw_enemy_heavy, cols=4)
    make_sheet(SPRITES / "drone_sheet.png", list(range(6)), draw_drone, cols=3)
    make_sheet(SPRITES / "effects_sheet.png", list(range(9)), draw_effect, cols=5)
    draw_tiles()
    draw_props()


if __name__ == "__main__":
    main()
