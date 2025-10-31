// ビンゴ抽選アプリのメインロジック
class BingoApp {
    constructor() {
        this.maxNumber = 75;
        this.maxDrawCount = 30; // 最大抽選回数
        this.allNumbers = this.generateNumbers();
        this.drawnNumbers = [];
        this.availableNumbers = [...this.allNumbers];
        
        this.initElements();
        this.initEventListeners();
        this.renderAllNumbers();
    }

    // 1から75までの数字配列を生成
    generateNumbers() {
        return Array.from({ length: this.maxNumber }, (_, i) => i + 1);
    }

    // DOM要素の取得
    initElements() {
        this.currentNumberEl = document.getElementById('currentNumber');
        this.remainingCountEl = document.getElementById('remainingCount');
        this.drawBtn = document.getElementById('drawBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.historyGrid = document.getElementById('historyGrid');
        this.numbersGrid = document.getElementById('numbersGrid');
    }

    // イベントリスナーの設定
    initEventListeners() {
        this.drawBtn.addEventListener('click', () => this.drawNumber());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Enterキーでも抽選できるようにする
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.drawBtn.disabled) {
                this.drawNumber();
            }
        });
    }

    // 番号を抽選
    drawNumber() {
        if (this.availableNumbers.length === 0) {
            alert('全ての番号が抽選されました！');
            return;
        }

        // 抽選中はボタンを無効化
        this.drawBtn.disabled = true;
        this.resetBtn.disabled = true;

        // ランダムに番号を選択
        const randomIndex = Math.floor(Math.random() * this.availableNumbers.length);
        const drawnNumber = this.availableNumbers[randomIndex];

        // ルーレット演出を実行
        this.playRouletteAnimation(drawnNumber, () => {
            // 選択された番号を削除
            this.availableNumbers.splice(randomIndex, 1);
            
            // 抽選された番号を履歴に追加（最新を先頭に）
            this.drawnNumbers.unshift(drawnNumber);

            // UIを更新
            this.updateRemainingCount();
            this.updateHistory();
            this.updateNumbersGrid(drawnNumber);

            // 30回抽選したか、全て抽選済みの場合
            if (this.drawnNumbers.length >= this.maxDrawCount) {
                setTimeout(() => {
                    alert(`🎉 ${this.maxDrawCount}回の抽選が完了しました！\n自動的にリセットします。`);
                    setTimeout(() => {
                        this.autoReset();
                    }, 1000);
                }, 500);
            } else if (this.availableNumbers.length === 0) {
                setTimeout(() => {
                    alert('🎉 全ての番号が抽選されました！');
                }, 500);
            } else {
                // まだ番号が残っている場合はボタンを再有効化
                this.drawBtn.disabled = false;
                this.resetBtn.disabled = false;
            }
        });
    }

    // ルーレット演出
    playRouletteAnimation(finalNumber, callback) {
        let counter = 0;
        const totalSpins = 30; // 回転回数
        let currentSpeed = 30; // 初期速度（ミリ秒）
        
        const spin = () => {
            if (counter < totalSpins) {
                // ランダムな数字を表示（1-75）
                const randomNum = Math.floor(Math.random() * this.maxNumber) + 1;
                this.currentNumberEl.textContent = randomNum;
                this.currentNumberEl.classList.add('spinning');
                
                counter++;
                
                // 徐々に速度を落とす
                if (counter > totalSpins * 0.6) {
                    currentSpeed += 15;
                } else if (counter > totalSpins * 0.3) {
                    currentSpeed += 5;
                }
                
                setTimeout(spin, currentSpeed);
            } else {
                // 最終的な番号を表示
                this.currentNumberEl.classList.remove('spinning');
                this.currentNumberEl.textContent = finalNumber;
                this.currentNumberEl.classList.add('final-number');
                
                // 花火エフェクトを追加
                this.showFireworks();
                
                // アニメーションクラスを削除
                setTimeout(() => {
                    this.currentNumberEl.classList.remove('final-number');
                }, 1000);
                
                callback();
            }
        };
        
        spin();
    }

    // 花火エフェクト
    showFireworks() {
        const section = document.querySelector('.current-number-section');
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const spark = document.createElement('div');
                spark.className = 'spark';
                spark.style.left = '50%';
                spark.style.top = '50%';
                
                const angle = (Math.PI * 2 * i) / 20;
                const velocity = 100 + Math.random() * 50;
                const tx = Math.cos(angle) * velocity;
                const ty = Math.sin(angle) * velocity;
                
                spark.style.setProperty('--tx', `${tx}px`);
                spark.style.setProperty('--ty', `${ty}px`);
                
                section.appendChild(spark);
                
                setTimeout(() => spark.remove(), 1000);
            }, i * 10);
        }
    }

    // 現在の番号表示を更新
    updateCurrentNumber(number) {
        this.currentNumberEl.textContent = number;
        
        // アニメーション効果
        this.currentNumberEl.classList.remove('draw-animation');
        void this.currentNumberEl.offsetWidth; // リフロー強制
        this.currentNumberEl.classList.add('draw-animation');
    }

    // 残り個数を更新
    updateRemainingCount() {
        this.remainingCountEl.textContent = this.availableNumbers.length;
    }

    // 履歴表示を更新
    updateHistory() {
        // 空メッセージを削除
        const emptyMessage = this.historyGrid.querySelector('.empty-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }

        // 履歴をクリアして再描画
        this.historyGrid.innerHTML = '';
        
        this.drawnNumbers.forEach((number, index) => {
            const numberEl = document.createElement('div');
            numberEl.className = 'history-number';
            numberEl.textContent = number;
            numberEl.style.animationDelay = `${index * 0.05}s`;
            this.historyGrid.appendChild(numberEl);
        });
    }

    // 全番号グリッドを初期描画
    renderAllNumbers() {
        this.numbersGrid.innerHTML = '';
        
        this.allNumbers.forEach(number => {
            const cell = document.createElement('div');
            cell.className = 'number-cell';
            cell.textContent = number;
            cell.dataset.number = number;
            this.numbersGrid.appendChild(cell);
        });
    }

    // 全番号グリッドの特定番号を更新
    updateNumbersGrid(drawnNumber) {
        const cell = this.numbersGrid.querySelector(`[data-number="${drawnNumber}"]`);
        if (cell) {
            cell.classList.add('drawn');
        }
    }

    // 手動リセット
    reset() {
        const confirmReset = confirm('リセットしてもよろしいですか？');
        if (!confirmReset) return;

        this.performReset();
    }

    // 自動リセット
    autoReset() {
        this.performReset();
    }

    // リセット処理
    performReset() {
        this.drawnNumbers = [];
        this.availableNumbers = [...this.allNumbers];
        
        this.currentNumberEl.textContent = '--';
        this.currentNumberEl.classList.remove('spinning', 'final-number');
        this.remainingCountEl.textContent = this.maxNumber;
        this.drawBtn.disabled = false;
        this.resetBtn.disabled = false;
        
        // 履歴をクリア
        this.historyGrid.innerHTML = '<div class="empty-message">まだ抽選されていません</div>';
        
        // 全番号グリッドをリセット
        const allCells = this.numbersGrid.querySelectorAll('.number-cell');
        allCells.forEach(cell => cell.classList.remove('drawn'));
    }
}

// アプリを初期化
document.addEventListener('DOMContentLoaded', () => {
    new BingoApp();
});

