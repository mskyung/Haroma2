const DEAD_ZONE = 6;          // 움직임이 이 이하면 "탭"
const DRAG_THRESHOLD = 12;    // 이 이상이면 "드래그"
const LONG_PRESS_MS = 500;    // 길게누름(엔터) 판정
const DOUBLE_TAP_MS =  280;    // 더블탭(마침표) 판정

class HaromaKeyboard {
    constructor(options) {
        this.display = document.getElementById(options.displayId);
        this.displayContainer = document.getElementById(options.displayContainerId);
        this.keyboardContainer = document.getElementById(options.keyboardContainerId);
        this.layerButtons = document.querySelectorAll(options.layerButtonSelector);
        this.settingsModal = document.getElementById(options.settingsModalId);

        // 한글 조합 상수 (KR 레이어 전용)
        this.CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        this.JUNGSUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
        this.JONGSUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        this.DOUBLE_FINAL = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };
        this.REVERSE_DOUBLE_FINAL = Object.fromEntries(Object.entries(this.DOUBLE_FINAL).map(([key, val]) => [val, key.split('')]));
		this.COMPLEX_VOWEL = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ', 'ㅓㅣ':'ㅔ', 'ㅕㅣ':'ㅖ', 'ㅏㅣ':'ㅐ', 'ㅑㅣ':'ㅒ' };

        // 드래그 제스처 맵 (KR 레이어 전용)
        this.VOWEL_DRAG_MAP = {
            'ㅇ': 'ㅏ', 'ㄷ': 'ㅓ', 'ㅅ': 'ㅗ', 'ㅂ': 'ㅜ',
            'ㄱ': 'ㅣ', 'ㅈ': 'ㅣ', 'ㄴ': 'ㅡ', 'ㅁ': 'ㅡ'
        };
        this.IOTIZED_VOWEL_MAP = {
            'ㅏ': 'ㅑ', 'ㅓ': 'ㅕ', 'ㅗ': 'ㅛ', 'ㅜ': 'ㅠ', 'ㅡ': 'ㅢ', 'ㅣ': 'ㅢ'
        };
        this.COMPOUND_VOWEL_MAP = {
            'ㅏ': { 'ㄱ': 'ㅒ', 'ㅁ': 'ㅐ' },
            'ㅓ': { 'ㅈ': 'ㅖ', 'ㄴ': 'ㅔ' },
            'ㅗ': { 'ㄱ': 'ㅘ', 'ㅈ': 'ㅚ' },
            'ㅜ': { 'ㅁ': 'ㅟ', 'ㄴ': 'ㅝ' },
            'ㅘ': { 'ㅇ': 'ㅙ' },
            'ㅝ': { 'ㄷ': 'ㅞ' }
        };

        // K-E 레이어를 위한 3개의 새 맵
        this.KE_VOWEL_DRAG_MAP = {
            'ㅇ': 'k', 'ㄷ': 'j', 'ㅅ': 'h', 'ㅂ': 'n',
            'ㄱ': 'l', 'ㅈ': 'l', 'ㄴ': 'm', 'ㅁ': 'm'
        };
        this.KE_IOTIZED_VOWEL_MAP = {
            'ㅏ': 'i', 'ㅓ': 'u', 'ㅗ': 'y', 'ㅜ': 'b', 'ㅡ': 'ml', 'ㅣ': 'ml'
        };
        this.KE_COMPOUND_VOWEL_MAP = {
            'ㅏ': { 'ㄱ': 'o', 'ㅁ': 'o' },
            'ㅓ': { 'ㅈ': 'p', 'ㄴ': 'p' },
            'ㅗ': { 'ㄱ': 'hk', 'ㅈ': 'hl' },
            'ㅜ': { 'ㅁ': 'nl', 'ㄴ': 'nj' },
            'ㅘ': { 'ㅇ': 'ho' },
            'ㅝ': { 'ㄷ': 'np' }
        };

        this.KEY_POSITION_TO_CONSONANT = {
            'octagon-big1': 'ㄱ', 'octagon-big2': 'ㄴ', 'octagon-big3': 'ㄷ', 'octagon-big4': 'ㅁ',
            'octagon-big5': 'ㅂ', 'octagon-big6': 'ㅅ', 'octagon-big7': 'ㅇ', 'octagon-big8': 'ㅈ'
        };

		this.EN_DRAG_MAP = { 'h': 'a', 'd': 'e', 's': 'o', 'b': 'u', 'n': 'y', 'g': 'i' };

        this.state = {
            lastCharInfo: null, capsLock: false, scale: 1.0, activeLayer: 'KR',
            isPointerDown: false, pointerMoved: false, clickTimeout: null,
            horizontalOffset: 0, verticalOffset: 0, pointerOwnerEl: null,
            dragState: {
                isActive: false, conceptualVowel: null, lastOutput: null,
                isEnDrag: false, startX: 0, startY: 0
            },
			tapState: { lastTapAt: 0, longPressFired: false, centerPressed: false, centerDragHasExited: false }
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.attachEventListeners();
        this.switchLayer('KR');
    }

    loadSettings() {
        const savedScale = localStorage.getItem('keyboardScale');
        if (savedScale) this.state.scale = parseFloat(savedScale);
        const savedHorizontalOffset = localStorage.getItem('keyboardHorizontalOffset');
        if (savedHorizontalOffset) {
            this.state.horizontalOffset = parseInt(savedHorizontalOffset, 10);
            this.applyHorizontalPosition();
        }
        const savedVerticalOffset = localStorage.getItem('keyboardVerticalOffset');
        if (savedVerticalOffset) this.state.verticalOffset = parseInt(savedVerticalOffset, 10);
        this.applyKeyboardTransform();
    }

    attachEventListeners() {
        let lastHoveredKey = null;
		const isInCenter = (x, y) => {
			const el = document.elementFromPoint(x, y);
			return !!(el && el.closest('.octagon-center'));
		};

        const setupDragListener = (layerName, isEn = false) => {
            const layer = document.querySelector(`.layer[data-layer="${layerName}"]`);
            if (!layer) return;
            const centerOctagon = layer.querySelector('.octagon-center');
            if (!centerOctagon) return;

            centerOctagon.addEventListener('pointerdown', e => {
				this.state.tapState.centerPressed = true;
				this.state.tapState.longPressFired = false;
				this.state.tapState.centerDragHasExited = false;
				this.state.dragState = {
					isActive: true,
					startX: e.clientX,
					startY: e.clientY,
				};
				// 길게누름 타이머
				clearTimeout(this._centerLongTimer);
				this._centerLongTimer = setTimeout(() => {
					// 드래그로 넘어가거나 이미 처리되었으면 무시
					if (!this.state.dragState.isActive || !this.state.tapState.centerPressed) return;
					this.insertAtCursor('\n');
					this.resetComposition();
					this.state.tapState.longPressFired = true;
				}, LONG_PRESS_MS);

                if (this.state.activeLayer !== layerName) return;
                this.state.dragState = {
                    isActive: true, conceptualVowel: null, lastOutput: null,
                    isEnDrag: isEn, startX: e.clientX, startY: e.clientY
                };
                this.state.pointerMoved = false;
                lastHoveredKey = centerOctagon;
                e.preventDefault();
            });
        };

        setupDragListener('KR');
        setupDragListener('K-E');
        setupDragListener('EN', true);

        document.addEventListener('pointermove', e => {
			const dx = e.clientX - this.state.dragState.startX;
			const dy = e.clientY - this.state.dragState.startY;
			const movedDist = Math.hypot(dx, dy);

			if (!this.state.dragState.isActive || !this.state.tapState.centerPressed) return;

			// 한번이라도 센터 밖으로 나가면 플래그 ON
			if (!this.state.tapState.centerDragHasExited && !isInCenter(e.clientX, e.clientY)) {
				this.state.tapState.centerDragHasExited = true;   //밖으로 나감
			}
			
			// 중앙키 누른 상태에서 충분히 움직이면 = 드래그 시작 → 길게누름 취소
			if (this.state.tapState.centerPressed && movedDist > DRAG_THRESHOLD) {
				clearTimeout(this._centerLongTimer);
			}
            if (!this.state.dragState.isActive) return;

            const currentElement = document.elementFromPoint(e.clientX, e.clientY);
            if (!currentElement) return;
            const targetKey = currentElement.closest('[data-click]');
            if (!targetKey || targetKey === lastHoveredKey) return;
            lastHoveredKey = targetKey;

            if (this.state.activeLayer === 'K-E') {
                const bigClass = Array.from(targetKey.classList).find(c => c.startsWith('octagon-big'));
				const consonant = this.KEY_POSITION_TO_CONSONANT[bigClass];

                if (!this.state.dragState.conceptualVowel) {
                    if (targetKey.classList.contains('octagon-center')) return;
                    const output = this.KE_VOWEL_DRAG_MAP[consonant];
                    if (output) {
                        this.insertAtCursor(output);
                        this.state.dragState.conceptualVowel = this.VOWEL_DRAG_MAP[consonant];
                        this.state.dragState.lastOutput = output;
                    }
                } else {
                    if (targetKey.classList.contains('octagon-center')) {
                        const newOutput = this.KE_IOTIZED_VOWEL_MAP[this.state.dragState.conceptualVowel];
                        if (newOutput && newOutput !== this.state.dragState.lastOutput) {
                            this.replaceTextBeforeCursor(this.state.dragState.lastOutput.length, newOutput);
                            this.state.dragState.conceptualVowel = this.IOTIZED_VOWEL_MAP[this.state.dragState.conceptualVowel];
                            this.state.dragState.lastOutput = newOutput;
                        }
                    } else {
                        const compoundMap = this.KE_COMPOUND_VOWEL_MAP[this.state.dragState.conceptualVowel];
                        if (compoundMap && compoundMap[consonant]) {
                            const newOutput = compoundMap[consonant];
                            this.replaceTextBeforeCursor(this.state.dragState.lastOutput.length, newOutput);
                            this.state.dragState.conceptualVowel = this.COMPOUND_VOWEL_MAP[this.state.dragState.conceptualVowel][consonant];
                            this.state.dragState.lastOutput = newOutput;
                        }
                    }
                }
            }
            else if (this.state.activeLayer === 'KR') {
                 if (targetKey.classList.contains('octagon-center')) {
                    const { conceptualVowel } = this.state.dragState;
                    if (conceptualVowel) {
                        const newVowel = this.IOTIZED_VOWEL_MAP[conceptualVowel];
                        if (newVowel) this.updateSyllable(newVowel);
                    }
                } else {
                    const consonant = targetKey.dataset.click;
                    if (!this.state.dragState.conceptualVowel) {
                        const newVowel = this.VOWEL_DRAG_MAP[consonant];
                        if (newVowel) this.handleInput(newVowel);
                    } else {
                        const compoundMap = this.COMPOUND_VOWEL_MAP[this.state.dragState.conceptualVowel];
                        if (compoundMap && compoundMap[consonant]) {
                            const newVowel = compoundMap[consonant];
                            this.updateSyllable(newVowel);
                        }
                    }
                }
            }
            else if (this.state.dragState.isEnDrag) {
                 if (!targetKey.classList.contains('octagon-center')) {
                    const charToInput = this.EN_DRAG_MAP[targetKey.dataset.click];
                    if (charToInput) {
                        this.handleInput(charToInput);
                        this.state.dragState.isActive = false;
                    }
                 }
            }
        });

        document.addEventListener('pointerup', e => {
			if (!this.state.dragState.isActive) return;

			const dx = e.clientX - this.state.dragState.startX;
			const dy = e.clientY - this.state.dragState.startY;
			const movedDist = Math.hypot(dx, dy);
			const nowInCenter = isInCenter(e.clientX, e.clientY);

			// 중앙키로 시작한 경우: 탭/더블탭/길게누름/드래그 처리
			if (this.state.tapState.centerPressed) {
				clearTimeout(this._centerLongTimer);

				// 길게누름이 이미 발동했으면 더 처리하지 않음
				if (!this.state.tapState.longPressFired) {
					if (movedDist <= DEAD_ZONE) {
						// 탭 또는 더블탭
						const now = Date.now();
						// Robust outputs for keys that may not have data-click/dblclick (e.g., consonant octagons)
						const _label = (el.textContent || '').trim();
						const _fallback = el.dataset.char || el.dataset.key || _label;

						if (now - this.state.tapState.lastTapAt <= DOUBLE_TAP_MS) {
							const cur = this.display.selectionStart;
							const hasSpaceBefore = cur > 0 && this.display.value[cur - 1] === ' ';
							if (hasSpaceBefore) this.replaceTextBeforeCursor(1, '. ');
							else this.insertAtCursor('. ');
							this.resetComposition();
							this.state.tapState.lastTapAt = 0;
						} else {
							this.insertAtCursor(' ');
							this.resetComposition();
							this.state.tapState.lastTapAt = Date.now();
						}
					} else {
						// 드래그 제스처
						if (this.state.tapState.centerDragHasExited) {
						} else {
							// 한번도 밖으로 안 나감 → 내부 드래그: 콤마
							if (nowInCenter) {
								this.insertAtCursor(', ');      // 원하면 ','
								this.resetComposition();
							}
						}
					}
				}
				// 중앙키 플래그 및 드래그 종료
				this.state.tapState.centerPressed = false;
				this.state.dragState.isActive = false;
				return;
			}
			// 중앙키 외에는 별도 처리 없음
			this.state.dragState.isActive = false;
		});
        this.attachRemainingListeners();
    }

    updateSyllable(newVowel) {
        if (this.state.lastCharInfo && this.state.lastCharInfo.type === 'CV') {
            const cho = this.state.lastCharInfo.cho;
            const newChar = this.combineCode(cho, newVowel);
            this.replaceTextBeforeCursor(1, newChar);
            this.state.lastCharInfo = { type: 'CV', cho: cho, jung: newVowel };
        } else {
            this.replaceTextBeforeCursor(1, newVowel);
            this.resetComposition();
        }
        this.state.dragState.conceptualVowel = newVowel;
    }

    handleInput(char) {
        if (typeof char !== 'string' || !char.trim() && char !== ' ') return;
        const isKR = this.CHOSUNG.includes(char) || this.JUNGSUNG.includes(char);

        if (this.state.activeLayer === 'KR' && isKR) {
            this.composeHangul(char);
        } else {
            this.resetComposition();
            let charToInsert = char;
            if (this.state.activeLayer === 'EN' && this.state.capsLock && /^[a-z]$/.test(char)) {
                charToInsert = char.toUpperCase();
            }
            this.insertAtCursor(charToInsert);
        }
    }

    composeHangul(char) {
        const last = this.state.lastCharInfo;
        const isChosung = this.CHOSUNG.includes(char);
        const isJungsung = this.JUNGSUNG.includes(char);
        if (this.display.selectionStart !== this.display.selectionEnd) this.resetComposition();

        if (isChosung) {
            if (last && last.type === 'CV' && this.JONGSUNG.includes(char)) {
                const newChar = this.combineCode(last.cho, last.jung, char);
                this.replaceTextBeforeCursor(1, newChar);
                this.state.lastCharInfo = { type: 'CVJ', cho: last.cho, jung: last.jung, jong: char };
            } else if (last && last.type === 'CVJ' && this.DOUBLE_FINAL[last.jong + char]) {
                const newJong = this.DOUBLE_FINAL[last.jong + char];
                const newChar = this.combineCode(last.cho, last.jung, newJong);
                this.replaceTextBeforeCursor(1, newChar);
                this.state.lastCharInfo = { type: 'CVJ', cho: last.cho, jung: last.jung, jong: newJong };
            } else {
                this.insertAtCursor(char);
                this.state.lastCharInfo = { type: 'C', cho: char };
                this.state.dragState.conceptualVowel = null;
            }
        } else if (isJungsung) {
            if (last && last.type === 'C') {
                const newChar = this.combineCode(last.cho, char);
                this.replaceTextBeforeCursor(1, newChar);
                this.state.lastCharInfo = { type: 'CV', cho: last.cho, jung: char };
            } else if (last && last.type === 'CV' && this.COMPLEX_VOWEL[last.jung + char]) {
                const newVowel = this.COMPLEX_VOWEL[last.jung + char];
                const newChar = this.combineCode(last.cho, newVowel);
                this.replaceTextBeforeCursor(1, newChar);
                this.state.lastCharInfo = { type: 'CV', cho: last.cho, jung: newVowel };
            } else if (last && last.type === 'CVJ') {
                const doubleJong = this.REVERSE_DOUBLE_FINAL[last.jong];
                let char1, char2;
                if (doubleJong) {
                    char1 = this.combineCode(last.cho, last.jung, doubleJong[0]);
                    char2 = this.combineCode(doubleJong[1], char);
                    this.state.lastCharInfo = { type: 'CV', cho: doubleJong[1], jung: char };
                } else {
                    char1 = this.combineCode(last.cho, last.jung);
                    char2 = this.combineCode(last.jong, char);
                    this.state.lastCharInfo = { type: 'CV', cho: last.jong, jung: char };
                }
                this.replaceTextBeforeCursor(1, char1 + char2);
            } else {
                this.insertAtCursor(char);
                this.resetComposition();
            }
            this.state.dragState.conceptualVowel = char;
        }
    }

    combineCode(cho, jung, jong = '') {
        const ci = this.CHOSUNG.indexOf(cho);
        const ji = this.JUNGSUNG.indexOf(jung);
        const joi = this.JONGSUNG.indexOf(jong);
        if (ci < 0 || ji < 0) return cho + (jung || '') + (jong || '');
        return String.fromCharCode(0xAC00 + (ci * 21 + ji) * 28 + joi);
    }

    attachRemainingListeners() {
        document.querySelectorAll('[data-click]').forEach(el => {
            // 중앙 키 예외 처리 로직 수정
            const parentLayer = el.closest('.layer');
            if (el.classList.contains('octagon-center') && parentLayer) {
                const layerName = parentLayer.dataset.layer;
                // KR, K-E, EN 레이어의 중앙 키는 별도 드래그 로직을 사용하므로 제외
                if (layerName === 'KR' || layerName === 'K-E' || layerName === 'EN') {
                    return;
                }
            }

            let pointerMoved = false;
			let downX = 0, downY = 0;
			// 각 키별 탭상태 저장
			let lastTapAt = 0;
			let singleTapTimer = null;			
			let lastTapKeyId = null;
			const TAP_MS =  280;          // 350~450 추천
			const DEAD = DRAG_THRESHOLD; // 기존 임계값(12px) 재사용
			// 드래그 처리용
			let isDraggingKey = false;        // 드래그 모드인지
			let dragStartedCharInserted = false; // 시작 글자 한 번만 넣기

            el.addEventListener('pointerdown', e => {
                if (this.state.tapState.centerPressed) return;
				if (el.setPointerCapture) el.setPointerCapture(e.pointerId);

				this.state.pointerOwnerEl = el;        // ★ 오너 지정
				this.state.isPointerDown = true;
				pointerMoved = false;
				isDraggingKey = false;
				dragStartedCharInserted = false;
				downX = e.clientX; downY = e.clientY;
				e.preventDefault();
            });

            el.addEventListener('pointermove', e => {
				if (this.state.pointerOwnerEl !== el) return;
				if (!this.state.isPointerDown) return;

				const dx = e.clientX - downX, dy = e.clientY - downY;
				if (!pointerMoved && Math.hypot(dx, dy) > DEAD) {
					pointerMoved = true;
					isDraggingKey = true;
					if (!dragStartedCharInserted) {
						const startChar = el.dataset.drag || el.dataset.click; // ★ 드래그 시작은 drag 우선
						if (startChar) this.handleInput(startChar);
						dragStartedCharInserted = true;
						if (singleTapTimer) { clearTimeout(singleTapTimer); singleTapTimer = null; }
					}
				}
			});

            el.addEventListener('pointerup', e => {
				if (this.state.pointerOwnerEl !== el) return;
				if (el.releasePointerCapture) {
					try { el.releasePointerCapture(e.pointerId); } catch {}
				}

				const wasDrag = isDraggingKey;
				this.state.isPointerDown = false;
				this.state.pointerOwnerEl = null; 

				if (wasDrag) return;

				const now = Date.now();
				const keyId = el.id || el.dataset.key || el.dataset.click || '';
				const clickOutput = el.dataset.click || '';
				const dblclickOutput = el.dataset.dblclick || clickOutput;
				const isDouble = (keyId && lastTapKeyId === keyId && (now - lastTapAt) <= TAP_MS);

				if (isDouble) {
					if (singleTapTimer) { clearTimeout(singleTapTimer); singleTapTimer = null; }
					const li = this.state.lastCharInfo;
					const pos = this.display.selectionStart;
					const prev = pos > 0 ? this.display.value[pos - 1] : '';
					if (li && li.type === 'C' && prev === clickOutput) {
						this.replaceTextBeforeCursor(1, dblclickOutput);
						this.state.lastCharInfo = { type: 'C', cho: dblclickOutput };
					} else {
						this.handleInput(dblclickOutput);
					}
					lastTapAt = 0;
					lastTapKeyId = null;
				} else {
					lastTapAt = now;
					lastTapKeyId = keyId;
					if (singleTapTimer) { clearTimeout(singleTapTimer); }
					singleTapTimer = setTimeout(() => {
						if (clickOutput) this.handleInput(clickOutput);
						singleTapTimer = null;
						// lastTapAt / lastTapKeyId 는 유지해도 무방 (다음 탭에서 자연스럽게 갱신)
					}, TAP_MS);
				}
			});
            el.addEventListener('pointerleave', (e) => {
				// ★ 오너일 때만 정리
				if (this.state.pointerOwnerEl === el) {
					this.state.isPointerDown = false;
					this.state.pointerOwnerEl = null;
					if (el.releasePointerCapture && e && typeof e.pointerId !== 'undefined') {
						try { el.releasePointerCapture(e.pointerId); } catch {}
					}
				}
				if (singleTapTimer) { clearTimeout(singleTapTimer); singleTapTimer = null; }
			});
		document.addEventListener('pointercancel', () => {
			// 전역 안전망
			this.state.isPointerDown = false;
			this.state.pointerOwnerEl = null;
			if (singleTapTimer) { clearTimeout(singleTapTimer); singleTapTimer = null; }
		});
    });

        this.display.addEventListener('click', () => this.resetComposition());
        this.display.addEventListener('keyup', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) this.resetComposition();
        });

        document.getElementById('backspace').addEventListener('click', () => { this.backspace(); this.resetComposition(); });
        document.getElementById('delete-btn').addEventListener('click', () => { this.deleteNextChar(); this.resetComposition(); });
        document.getElementById('refresh-btn').addEventListener('click', () => this.clear());
        document.getElementById('copy-btn').addEventListener('click', () => this.copyToClipboard());
		document.getElementById('cursor-left').addEventListener('click', () => {
			const pos = this.display.selectionStart;
			if (pos > 0) {
				this.display.selectionStart = this.display.selectionEnd = pos - 1;
			}
			this.display.focus();
			this.resetComposition();
		});
		document.getElementById('cursor-right').addEventListener('click', () => {
			const pos = this.display.selectionEnd;
			if (pos < this.display.value.length) {
				this.display.selectionStart = this.display.selectionEnd = pos + 1;
			}
			this.display.focus();
			this.resetComposition();
		});
		document.getElementById('scale-up').addEventListener('click', () => this.setScale(this.state.scale + 0.01));
        document.getElementById('scale-down').addEventListener('click', () => this.setScale(this.state.scale - 0.01));
        document.getElementById('hand-left').addEventListener('click', () => this.moveKeyboard(-10));
        document.getElementById('hand-right').addEventListener('click', () => this.moveKeyboard(10));
        document.getElementById('position-up').addEventListener('click', () => this.moveKeyboardVertical(-10));
        document.getElementById('position-down').addEventListener('click', () => this.moveKeyboardVertical(10));

		document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());
        document.querySelector('.close-button').addEventListener('click', () => this.closeSettings());
        window.addEventListener('click', (event) => { if (event.target == this.settingsModal) this.closeSettings(); });
        this.layerButtons.forEach(btn => btn.addEventListener('click', () => this.switchLayer(btn.dataset.layer)));
    }

    // 기능 함수들
    backspace() {
        const start = this.display.selectionStart;
        const end = this.display.selectionEnd;
        if (start === 0 && end === 0) return;
        let newCursorPos = start;
        if (start === end) {
            if (start > 0) {
                this.display.value = this.display.value.substring(0, start - 1) + this.display.value.substring(start);
                newCursorPos = start - 1;
            }
        } else {
            this.display.value = this.display.value.substring(0, start) + this.display.value.substring(end);
            newCursorPos = start;
        }
        this.display.selectionStart = this.display.selectionEnd = newCursorPos;
        this.resetComposition();
        this.display.focus();
    }

	deleteNextChar() {
        const start = this.display.selectionStart;
        const end = this.display.selectionEnd;
        const text = this.display.value;
        if (start === end && start < text.length) {
            this.display.value = text.substring(0, start) + text.substring(start + 1);
            this.display.selectionStart = this.display.selectionEnd = start;
        } else if (start < end) {
            this.display.value = text.substring(0, start) + text.substring(end);
            this.display.selectionStart = this.display.selectionEnd = start;
        }
        this.resetComposition();
        this.display.focus();
    }

	insertAtCursor(text) {
        const start = this.display.selectionStart;
        const end = this.display.selectionEnd;
        this.display.value = this.display.value.substring(0, start) + text + this.display.value.substring(end);
        this.display.selectionStart = this.display.selectionEnd = start + text.length;
        this.display.focus();
    }
	
	replaceTextBeforeCursor(charsToRemove, textToInsert) {
        const start = this.display.selectionStart;
        if (start < charsToRemove) return;
        const before = this.display.value.substring(0, start - charsToRemove);
        const after = this.display.value.substring(start);
        this.display.value = before + textToInsert + after;
        const newCursorPos = before.length + textToInsert.length;
        this.display.selectionStart = this.display.selectionEnd = newCursorPos;
        this.display.focus();
    }

	clear() {
        this.display.value = '';
        this.resetComposition();
    }

	copyToClipboard() {
        if (!this.display.value) return;
        navigator.clipboard?.writeText(this.display.value)
            .then(() => alert('클립보드에 복사되었습니다.'))
            .catch(() => {
				const ta = document.createElement('textarea');
				ta.value = this.display.value;
				document.body.appendChild(ta);
				ta.select();
				const ok = document.execCommand('copy');
				document.body.removeChild(ta);
				if (ok) alert('클립보드에 복사되었습니다.');
				else alert('복사 실패: 수동으로 복사해주세요.');
			});
    }

	resetComposition() {
        this.state.lastCharInfo = null;
    }

	setScale(newScale) {
        this.state.scale = Math.max(0.5, Math.min(newScale, 2.0));
        localStorage.setItem('keyboardScale', this.state.scale);
        this.applyKeyboardTransform();
    }
	
	applyHorizontalPosition() {
        this.keyboardContainer.style.left = `calc(50% + ${this.state.horizontalOffset}px)`;
    }

    moveKeyboard(direction) {
        this.state.horizontalOffset += direction;
        this.applyHorizontalPosition();
        localStorage.setItem('keyboardHorizontalOffset', this.state.horizontalOffset);
    }

    applyKeyboardTransform() {
        const scale = `scale(${this.state.scale})`;
        const translateX = `translateX(-50%)`;
        const translateY = `translateY(${this.state.verticalOffset}px)`;
        this.keyboardContainer.style.transform = `${translateY} ${translateX} ${scale}`;
    }

    moveKeyboardVertical(direction) {
        this.state.verticalOffset += direction;
        this.applyKeyboardTransform();
        localStorage.setItem('keyboardVerticalOffset', this.state.verticalOffset);
    }

    updateEnKeyCaps() {
        const isCaps = this.state.capsLock;
        const enKeys = document.querySelectorAll('.layer[data-layer="EN"] text');
        enKeys.forEach(key => {
            const char = key.textContent;
            if (char && char.length === 1 && char.match(/[a-z]/i)) {
                key.textContent = isCaps ? char.toUpperCase() : char.toLowerCase();
            }
        });
    }

    switchLayer(layerName) {
        if (layerName === 'EN') {
            if (this.state.activeLayer === 'EN') {
                this.state.capsLock = !this.state.capsLock;
            } else {
                this.state.capsLock = false;
            }
        } else {
            this.state.capsLock = false;
        }

        this.state.activeLayer = layerName;
        this.resetComposition();

        document.querySelectorAll('.layer').forEach(div => {
            div.classList.toggle('active', div.dataset.layer === layerName);
        });

        this.layerButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.layer === layerName);
        });

        const enButton = document.querySelector('button[data-layer="EN"]');
        if (enButton) {
            enButton.classList.toggle('caps-on', this.state.capsLock);
        }
        this.updateEnKeyCaps();
		this.state.dragState = { isActive:false, conceptualVowel:null, lastOutput:null, isEnDrag:false, startX:0, startY:0 };
		this.state.tapState.centerPressed = false;
		clearTimeout(this._centerLongTimer);
    }

    openSettings() {
        this.settingsModal.style.display = 'block';
    }

    closeSettings() {
        this.settingsModal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HaromaKeyboard({
        displayId: 'display',
        displayContainerId: 'display-container',
        keyboardContainerId: 'keyboard-container',
        layerButtonSelector: 'button[data-layer]',
        settingsModalId: 'settings-modal'
    });
});