class HaromaKeyboard {
    constructor(options) {
        // 주요 DOM 요소
        this.display = document.getElementById(options.displayId);
        this.displayContainer = document.getElementById(options.displayContainerId);
        this.keyboardContainer = document.getElementById(options.keyboardContainerId);
        this.layerButtons = document.querySelectorAll(options.layerButtonSelector);
        this.settingsModal = document.getElementById(options.settingsModalId);

        // 한글 조합 상수
        this.CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        this.JUNGSUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
        this.JONGSUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        this.DOUBLE_FINAL = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };
        this.REVERSE_DOUBLE_FINAL = Object.fromEntries(Object.entries(this.DOUBLE_FINAL).map(([key, val]) => [val, key.split('')]));
		this.COMPLEX_VOWEL = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ', 'ㅓㅣ':'ㅔ', 'ㅕㅣ':'ㅖ', 'ㅏㅣ':'ㅐ', 'ㅑㅣ':'ㅒ' };

        // 드래그 제스처 맵
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
		this.EN_DRAG_MAP = {
            'h': 'a', 'd': 'e', 's': 'o', 'b': 'u', 'n': 'y', 'g': 'w'
        };

        // 키보드 상태
        this.state = {
            lastCharInfo: null,
            capsLock: false,
            scale: 1.0,
            activeLayer: 'KR',
            isPointerDown: false,
            pointerMoved: false,
            clickTimeout: null,
            horizontalOffset: 0,
            verticalOffset: 0,
            dragState: {
                isActive: false,
                lastVowel: null,
                initialConsonant: null,
				//characterToInput: null, // 영문 드래그 시 입력할 문자
                isEnDrag: false // 영문 드래그 여부 플래그
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
        if (savedScale) {
			this.state.scale = parseFloat(savedScale);
		}        
        const savedHorizontalOffset = localStorage.getItem('keyboardHorizontalOffset');
        if (savedHorizontalOffset) {
            this.state.horizontalOffset = parseInt(savedHorizontalOffset, 10);
            this.applyHorizontalPosition();
        }        
        const savedVerticalOffset = localStorage.getItem('keyboardVerticalOffset');
        if (savedVerticalOffset) {
			this.state.verticalOffset = parseInt(savedVerticalOffset, 10);
        }
        this.applyKeyboardTransform();
    }
	
	// 모든 이벤트 리스너 등록
    attachEventListeners() {
        const krLayer = document.querySelector('.layer[data-layer="KR"]');
        if (krLayer) {
            const centerOctagon = krLayer.querySelector('.octagon-center');
            const outerOctagons = krLayer.querySelectorAll('[class^="octagon-big"]');

            if (centerOctagon) {
                centerOctagon.addEventListener('pointerdown', e => {
                    this.state.dragState = { isActive: true, lastVowel: null, initialConsonant: null };
                    this.state.pointerMoved = false; // 자음 드래그 후 모음 입력 시 종성이 추가되는 문제 해결
					e.preventDefault();
                });

                centerOctagon.addEventListener('pointerenter', () => {
                    const { isActive, lastVowel } = this.state.dragState;
                    if (isActive && lastVowel) {
                        const iotizedVowel = this.IOTIZED_VOWEL_MAP[lastVowel];
                        if (iotizedVowel) {
                            this.updateSyllable(iotizedVowel);
                            this.state.dragState.isActive = false; // 중앙 복귀는 항상 드래그 종료
                        }
                    }
                });
            }

            outerOctagons.forEach(el => {
                el.addEventListener('pointerenter', () => {
                    //if (!this.state.dragState.isActive) return;
					if (!this.state.dragState.isActive || this.state.dragState.isEnDrag) return;
                    const currentConsonant = el.dataset.click;
                    
                    if (!this.state.dragState.lastVowel) {
                        const vowel = this.VOWEL_DRAG_MAP[currentConsonant];
                        if (vowel) {
                            this.handleInput(vowel);
                            this.state.dragState.lastVowel = vowel;
                            this.state.dragState.initialConsonant = currentConsonant;
                        }
                    }
                    else {
                        if (currentConsonant === this.state.dragState.initialConsonant) return;
                        const compoundMap = this.COMPOUND_VOWEL_MAP[this.state.dragState.lastVowel];
                        if (compoundMap && compoundMap[currentConsonant]) {
                            const newVowel = compoundMap[currentConsonant];
                            this.updateSyllable(newVowel);
                            // 새로 만들어진 모음이 추가 조합이 가능한지 확인
                            if (!this.COMPOUND_VOWEL_MAP[newVowel]) {
                                // 'ㅙ', 'ㅞ' 등 추가 조합이 없는 모음이면 드래그 종료
                                this.state.dragState.isActive = false;
                            }
                            // 'ㅘ', 'ㅝ' 등 추가 조합이 가능하면 드래그 상태 유지
                        }
                    }
                });
            });
        }
		
		// --- [추가] 영문 레이어 드래그 이벤트 처리 ---
        const enLayer = document.querySelector('.layer[data-layer="EN"]');
        if (enLayer) {
            const centerOctagon = enLayer.querySelector('.octagon-center');
            const outerOctagons = enLayer.querySelectorAll('[class^="octagon-big"]');

            if (centerOctagon) {
                centerOctagon.addEventListener('pointerdown', e => {
                    if (this.state.activeLayer !== 'EN') return;
                    //this.state.dragState = { isActive: true, isEnDrag: true };
					this.state.dragState = { 
                        isActive: true, 
                        isEnDrag: true, 
                        pointerMoved: false,
                        startX: e.clientX,
                        startY: e.clientY
                    };
                    e.preventDefault();
                });
            }

            outerOctagons.forEach(el => {
				// 바깥 팔각형 영역에 들어가면 입력할 문자 준비
                el.addEventListener('pointerenter', () => {
                    if (!this.state.dragState.isActive || !this.state.dragState.isEnDrag) return;
                    
                    const key = el.dataset.click;
                    const charToInput = this.EN_DRAG_MAP[key];
                    if (charToInput) {
                        // 영역에 진입하는 즉시 문자 입력
                        this.handleInput(charToInput);
                        // 입력 후 드래그 상태를 즉시 초기화하여 중복 입력을 방지
                        this.state.dragState = { isActive: false, isEnDrag: false };
                    }
                });
            });
        }
		
		// [추가] 영문 중앙 드래그 시 포인터 이동 감지 리스너
        document.addEventListener('pointermove', e => {
            if (this.state.dragState.isActive && this.state.dragState.isEnDrag) {
                if (!this.state.dragState.pointerMoved && (Math.abs(e.clientX - this.state.dragState.startX) > 10 || Math.abs(e.clientY - this.state.dragState.startY) > 10)) {
                    this.state.dragState.pointerMoved = true;
                }
            }
        });
		
        // 포인터 up 이벤트 (모든 드래그 상태를 안전하게 초기화)
        document.addEventListener('pointerup', () => {
            if (this.state.dragState.isActive) {
                // 영문 드래그였고, 포인터가 움직이지 않았으면 클릭으로 간주
                if (this.state.dragState.isEnDrag && !this.state.dragState.pointerMoved) {
                    this.handleInput('i');
                }
				this.state.dragState = { isActive: false, lastVowel: null, initialConsonant: null, isEnDrag: false };
            }
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
        this.state.dragState.lastVowel = newVowel;
    }

    // 범용 입력 처리기
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
	
	// 한글 조합
    composeHangul(char) {
        const last = this.state.lastCharInfo;
        const isChosung = this.CHOSUNG.includes(char);
        const isJungsung = this.JUNGSUNG.includes(char);
        
        const start = this.display.selectionStart;
        const end = this.display.selectionEnd;

        if (start !== end) {
            this.resetComposition();
        }

        // 자음 입력 처리
        if (isChosung) {
            // 종성 결합 (예: '가' + 'ㄱ' -> '각')
            if (last && last.type === 'CV' && this.JONGSUNG.includes(char)) {
                const newChar = this.combineCode(last.cho, last.jung, char);
                this.replaceTextBeforeCursor(1, newChar);
                this.state.lastCharInfo = { type: 'CVJ', cho: last.cho, jung: last.jung, jong: char };
            // 겹받침 결합 (예: '각' + 'ㅅ' -> '갃')
            } else if (last && last.type === 'CVJ' && this.DOUBLE_FINAL[last.jong + char]) {
                const newJong = this.DOUBLE_FINAL[last.jong + char];
                const newChar = this.combineCode(last.cho, last.jung, newJong);
                this.replaceTextBeforeCursor(1, newChar);
                this.state.lastCharInfo = { type: 'CVJ', cho: last.cho, jung: last.jung, jong: newJong };
            } else {
                this.insertAtCursor(char);
                this.state.lastCharInfo = { type: 'C', cho: char };
            }
        // 모음 입력 처리
        } else if (isJungsung) {
            // 초성 + 모음 결합 (예: 'ㄱ' + 'ㅏ' -> '가')
            if (last && last.type === 'C') {
                const newChar = this.combineCode(last.cho, char);
                this.replaceTextBeforeCursor(1, newChar);
                this.state.lastCharInfo = { type: 'CV', cho: last.cho, jung: char };
            // 이중모음 결합 (예: '오' + 'ㅏ' -> '와')
            } else if (last && last.type === 'CV' && this.COMPLEX_VOWEL[last.jung + char]) {
                const newVowel = this.COMPLEX_VOWEL[last.jung + char];
                const newChar = this.combineCode(last.cho, newVowel);
                this.replaceTextBeforeCursor(1, newChar);
                this.state.lastCharInfo = { type: 'CV', cho: last.cho, jung: newVowel };
            // 종성 분리 후 결합 (예: '각' + 'ㅏ' -> '가' + '가')
            } else if (last && last.type === 'CVJ') {
                const doubleJong = this.REVERSE_DOUBLE_FINAL[last.jong];
                let char1, char2;
                if (doubleJong) { // 겹받침인 경우 (예: '갃' + 'ㅏ' -> '각사')
                    char1 = this.combineCode(last.cho, last.jung, doubleJong[0]);
                    char2 = this.combineCode(doubleJong[1], char);
                    this.state.lastCharInfo = { type: 'CV', cho: doubleJong[1], jung: char };
                } else { // 홑받침인 경우 (예: '각' + 'ㅏ' -> '가' + '가')
                    char1 = this.combineCode(last.cho, last.jung);
                    char2 = this.combineCode(last.jong, char);
                    this.state.lastCharInfo = { type: 'CV', cho: last.jong, jung: char };
                }
                this.replaceTextBeforeCursor(1, char1 + char2);
            } else {
                this.insertAtCursor(char);
                this.resetComposition();
            }
        }
    }

    combineCode(cho, jung, jong = '') {
        const ci = this.CHOSUNG.indexOf(cho);
        const ji = this.JUNGSUNG.indexOf(jung);
        const joi = this.JONGSUNG.indexOf(jong);
        if (ci < 0 || ji < 0) return cho + (jung || '') + (jong || '');
        return String.fromCharCode(0xAC00 + (ci * 21 + ji) * 28 + joi);
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

    resetComposition() {
        this.state.lastCharInfo = null;
    }
    
    attachRemainingListeners() {
        document.querySelectorAll('[data-click]').forEach(el => {
            // 한글 레이어의 중앙 팔각형은 자체 이벤트 리스너를 사용하므로 제외
			if (el.closest('.layer[data-layer="KR"]') && el.classList.contains('octagon-center')) return;
            // 영문 레이어의 중앙 팔각형도 자체 이벤트 리스너를 사용하므로 제외
            if (el.closest('.layer[data-layer="EN"]') && el.classList.contains('octagon-center')) return;
			// 중앙 팔각형은 자체 드래그 로직을 가지므로 나머지 리스너에서 제외
            //if (el.classList.contains('octagon-center')) return;
			
			let startX = 0, startY = 0;
            el.addEventListener('pointerdown', e => {
                this.state.isPointerDown = true;
                this.state.pointerMoved = false;
                startX = e.clientX; startY = e.clientY;
            });
            el.addEventListener('pointermove', e => {
                if (this.state.isPointerDown && (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10)) this.state.pointerMoved = true;
            });
            el.addEventListener('pointerup', e => {
                if (this.state.pointerMoved) this.handleInput(el.dataset.drag || el.dataset.click);
                this.state.isPointerDown = false;
            });
			// 드래그가 키 영역 밖으로 나가면 드래그를 '종료'하고 문자를 입력
            el.addEventListener('pointerleave', e => {
                if (this.state.isPointerDown && this.state.pointerMoved) {
                    // 해당 키의 드래그 문자를 입력합니다.
                    this.handleInput(el.dataset.drag || el.dataset.click);
                    // 드래그 상태를 완전히 초기화하여 중복 입력을 방지
                    this.state.isPointerDown = false;
                    this.state.pointerMoved = false;
                }
            });
			
            el.addEventListener('click', e => {
                e.preventDefault();
                if (this.state.pointerMoved) return;
                if (!this.state.clickTimeout) {
                    this.state.clickTimeout = setTimeout(() => {
                        this.handleInput(el.dataset.click);
                        this.state.clickTimeout = null;
                    }, 250);
                }
            });
            el.addEventListener('dblclick', e => {
                e.preventDefault();
                if (this.state.clickTimeout) {
                    clearTimeout(this.state.clickTimeout);
                    this.state.clickTimeout = null;
                }
                this.handleInput(el.dataset.dblclick || el.dataset.click);
            });
        });
        
		// 텍스트 영역(display) 이벤트 (커서 이동 시 조합 상태 초기화)
        this.display.addEventListener('click', () => this.resetComposition());
        this.display.addEventListener('keyup', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) this.resetComposition();
        });
		
		// 기능 버튼 이벤트
        document.getElementById('backspace').addEventListener('click', () => { this.backspace(); this.resetComposition(); });
        document.getElementById('space').addEventListener('click', () => this.handleInput(' '));
        document.getElementById('delete-btn').addEventListener('click', () => { this.deleteNextChar(); this.resetComposition(); });
        document.getElementById('refresh-btn').addEventListener('click', () => this.clear());
        document.getElementById('copy-btn').addEventListener('click', () => this.copyToClipboard());
		document.getElementById('enter').addEventListener('click', () => this.handleEnter());
        //document.getElementById('enter').addEventListener('click', () => this.handleInput('\n'));
        
		// 설정 창 내 버튼 이벤트
		document.getElementById('scale-up').addEventListener('click', () => this.setScale(this.state.scale + 0.01));
        document.getElementById('scale-down').addEventListener('click', () => this.setScale(this.state.scale - 0.01));
        document.getElementById('hand-left').addEventListener('click', () => this.moveKeyboard(-10));
        document.getElementById('hand-right').addEventListener('click', () => this.moveKeyboard(10));
        document.getElementById('position-up').addEventListener('click', () => this.moveKeyboardVertical(-10));
        document.getElementById('position-down').addEventListener('click', () => this.moveKeyboardVertical(10));
        
		// 설정 창 열기/닫기 이벤트
		document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());
        document.querySelector('.close-button').addEventListener('click', () => this.closeSettings());
        window.addEventListener('click', (event) => { if (event.target == this.settingsModal) this.closeSettings(); });
        this.layerButtons.forEach(btn => btn.addEventListener('click', () => this.switchLayer(btn.dataset.layer)));
    }	
	
	// 기능 함수들
    backspace() {
        const start = this.display.selectionStart;
        const end = this.display.selectionEnd;

        if (start === 0 && end === 0) {
            return; // 삭제할 내용이 없음
        }

        let newCursorPos = start;

        if (start === end) {
            // 선택 영역이 없을 때: 커서 앞의 한 글자 삭제
            if (start > 0) {
                this.display.value = this.display.value.substring(0, start - 1) + this.display.value.substring(start);
                newCursorPos = start - 1; // 커서를 한 칸 왼쪽으로 이동
            }
        } else {
            // 선택 영역이 있을 때: 선택된 내용 삭제
            this.display.value = this.display.value.substring(0, start) + this.display.value.substring(end);
            newCursorPos = start; // 커서를 삭제된 영역의 시작점으로 이동
        }

        this.display.selectionStart = this.display.selectionEnd = newCursorPos;
        this.resetComposition();
        this.display.focus(); // 텍스트 영역에 다시 포커스
    }
	
	deleteNextChar() {
        const start = this.display.selectionStart;
        const end = this.display.selectionEnd;
        const text = this.display.value;

        if (start === end && start < text.length) {
            // 커서 다음의 한 글자 삭제
            this.display.value = text.substring(0, start) + text.substring(start + 1);
            this.display.selectionStart = this.display.selectionEnd = start;
        } else if (start < end) {
            // 선택 영역 삭제
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

// 키보드 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
    new HaromaKeyboard({
        displayId: 'display',
        displayContainerId: 'display-container',
        keyboardContainerId: 'keyboard-container',
        layerButtonSelector: 'button[data-layer]',
        settingsModalId: 'settings-modal'
    });
});