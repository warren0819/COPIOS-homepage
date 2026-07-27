#!/usr/bin/env python3
"""발표자료 HTML을 AES-256-GCM으로 암호화해 assets/data.bin 을 생성한다.

사용법:
    pip install cryptography   # 최초 1회
    python3 tools/encrypt_deck.py <발표자료.html 경로> <비밀번호>

출력된 assets/data.bin 만 저장소에 커밋한다.
평문 HTML 은 절대 이 저장소(GitHub Pages 로 공개됨)에 커밋하지 않는다.
사이트의 비밀번호 입력값이 곧 복호화 키이므로, 비밀번호를 바꾸려면
새 비밀번호로 이 스크립트를 다시 실행하면 된다.
"""
import base64
import json
import os
import sys
import hashlib

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ITERATIONS = 600_000


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(f"usage: {sys.argv[0]} <deck.html> <password>")

    src, password = sys.argv[1], sys.argv[2]
    plaintext = open(src, "rb").read()

    salt = os.urandom(16)
    iv = os.urandom(12)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS, dklen=32)
    ciphertext = AESGCM(key).encrypt(iv, plaintext, None)

    out_path = os.path.join(os.path.dirname(__file__), "..", "assets", "data.bin")
    payload = {
        "v": 1,
        "kdf": "PBKDF2-SHA256",
        "iter": ITERATIONS,
        "salt": base64.b64encode(salt).decode(),
        "iv": base64.b64encode(iv).decode(),
        "data": base64.b64encode(ciphertext).decode(),
    }
    with open(out_path, "w") as f:
        json.dump(payload, f)
    print(f"encrypted {len(plaintext):,} bytes -> {os.path.normpath(out_path)}")


if __name__ == "__main__":
    main()
