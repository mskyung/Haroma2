class HaromaKeyboard {
    constructor(options) {
        // 주요 DOM 요소
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
            'ㄱ': 'ㅡ', 'ㅈ': 'ㅡ', 'ㄴ': 'ㅣ', 'ㅁ': 'ㅣ'
        };
        this.IOTIZED_VOWEL_MAP = {
            'ㅏ': 'ㅑ', 'ㅓ': 'ㅕ', 'ㅗ': 'ㅛ', 'ㅜ': 'ㅠ', 'ㅡ': 'ㅢ', 'ㅣ': 'ㅢ'
        };
        this.COMPOUND_VOWEL_MAP = {
            'ㅏ': { 'ㄱ': 'ㅐ', 'ㅁ': 'ㅒ' },
            'ㅓ': { 'ㅈ': 'ㅔ', 'ㄴ': 'ㅖ' },
            'ㅗ': { 'ㄱ': 'ㅘ', 'ㅈ': 'ㅚ' },
            'ㅜ': { 'ㅁ': 'ㅟ', 'ㄴ': 'ㅝ' },
            'ㅘ': { 'ㅇ': 'ㅙ' },
            'ㅝ': { 'ㄷ': 'ㅞ' }
        };

        // K-E 레이어를 위한 3개의 새 맵
        this.KE_VOWEL_DRAG_MAP = {
            'ㅇ': 'k', 'ㄷ': 'j', 'ㅅ': 'h', 'ㅂ': 'n',
            'ㄱ': 'm', 'ㅈ': 'm', 'ㄴ': 'l', 'ㅁ': 'l'
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

		this.EN_DRAG_MAP = { 'h': 'a', 'd': 'e', 's': 'o', 'b': 'u', 'n': 'y', 'g': 'w' };
        
        this.state = {
            lastCharInfo: null, capsLock: false, scale: 1.0, activeLayer: 'KR',
            isPointerDown: false, pointerMoved: false, clickTimeout: null,
            horizontalOffset: 0, verticalOffset: 0,
            dragState: {
                isActive: false, conceptualVowel: null, lastOutput: null,
                isEnDrag: false, startX: 0, startY: 0
            }
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

        const setupDragListener = (layerName, isEn = false) => {
            const layer = document.querySelector(`.layer[data-layer="${layerName}"]`);
            if (!layer) return;
            const centerOctagon = layer.querySelector('.octagon-center');
            if (!centerOctagon) return;

            centerOctagon.addEventListener('pointerdown', e => {
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
            if (!this.state.dragState.isActive) return;

            const currentElement = document.elementFromPoint(e.clientX, e.clientY);
            if (!currentElement) return;
            const targetKey = currentElement.closest('[data-click]');
            if (!targetKey || targetKey === lastHoveredKey) return;
            lastHoveredKey = targetKey;

            if (this.state.activeLayer === 'K-E') {
                const targetKeyClass = targetKey.classList[0];
                const consonant = this.KEY_POSITION_TO_CONSONANT[targetKeyClass];

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

            const moved = Math.abs(e.clientX - this.state.dragState.startX) > 10 || Math.abs(e.clientY - this.state.dragState.startY) > 10;
            if (!moved) {
                if (this.state.dragState.isEnDrag) {
                    this.handleInput(' ');
                } else if (this.state.activeLayer === 'KR') {
                    this.handleInput(' ');
                }
            }
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
            // [수정됨] 중앙 키 예외 처리 로직 수정
            const parentLayer = el.closest('.layer');
            if (el.classList.contains('octagon-center') && parentLayer) {
                const layerName = parentLayer.dataset.layer;
                // KR, K-E, EN 레이어의 중앙 키는 별도 드래그 로직을 사용하므로 제외
                if (layerName === 'KR' || layerName === 'K-E' || layerName === 'EN') {
                    return;
                }
            }
            
            let pointerMoved = false;
            
            el.addEventListener('pointerdown', e => {
                this.state.isPointerDown = true;
                pointerMoved = false;
            });

            el.addEventListener('pointermove', e => {
                if (this.state.isPointerDown && !pointerMoved) {
                    pointerMoved = true;
                }
            });

            el.addEventListener('pointerup', e => {
                if (this.state.isPointerDown && pointerMoved) {
                    this.handleInput(el.dataset.drag || el.dataset.click);
                }
                this.state.isPointerDown = false;
            });

            el.addEventListener('pointerleave', e => {
                if (this.state.isPointerDown && pointerMoved) {
                    this.handleInput(el.dataset.drag || el.dataset.click);
                    this.state.isPointerDown = false;
                }
            });

            el.addEventListener('click', e => {
                e.preventDefault();
                if (pointerMoved) return;
                
                if (this.state.clickTimeout) {
                    clearTimeout(this.state.clickTimeout);
                }
                this.state.clickTimeout = setTimeout(() => {
                    this.handleInput(el.dataset.click);
                }, 250);
            });

            el.addEventListener('dblclick', e => {
                e.preventDefault();
                if (pointerMoved) return;

                if (this.state.clickTimeout) {
                    clearTimeout(this.state.clickTimeout);
                    this.state.clickTimeout = null;
                }
                
                this.handleInput(el.dataset.dblclick || el.dataset.click);
            });
        });
        
        this.display.addEventListener('click', () => this.resetComposition());
        this.display.addEventListener('keyup', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) this.resetComposition();
        });
		
        document.getElementById('backspace').addEventListener('click', () => { this.backspace(); this.resetComposition(); });
        //document.getElementById('space').addEventListener('click', () => this.handleInput(' '));
        document.getElementById('delete-btn').addEventListener('click', () => { this.deleteNextChar(); this.resetComposition(); });
        document.getElementById('refresh-btn').addEventListener('click', () => this.clear());
        document.getElementById('copy-btn').addEventListener('click', () => this.copyToClipboard());
		document.getElementById('enter').addEventListener('click', () => this.handleEnter());
        
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
	
    // 이하 기능 함수들은 변경되지 않았습니다.
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
	
	handleEnter() {
        this.insertAtCursor('\n');
        this.resetComposition();
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
        navigator.clipboard.writeText(this.display.value)
            .then(() => alert('클립보드에 복사되었습니다.'))
            .catch(err => console.error('복사 실패:', err));
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