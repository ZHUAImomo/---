class MembershipCountdown {
    constructor() {
        this.form = document.getElementById('membershipForm');
        this.cardsGrid = document.getElementById('cardsGrid');
        this.memberships = new Map();

        this.initializeEventListeners();
        this.loadSavedData();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewMembership();
        });
    }

    addNewMembership() {
        const platform = document.getElementById('platform').value;
        const startDate = document.getElementById('startDate').value;
        const duration = parseInt(document.getElementById('duration').value);

        if (!platform || !startDate || !duration) return;

        const id = Date.now().toString();
        const membership = {
            id,
            platform,
            startDate,
            duration,
            isLocked: false
        };

        this.memberships.set(id, membership);
        this.createMembershipCard(membership);
        this.saveData();
        this.form.reset();
    }

    createMembershipCard(membership) {
        const card = document.createElement('div');
        card.className = 'membership-card';
        card.id = `card-${membership.id}`;
        
        const endDate = new Date(membership.startDate);
        endDate.setDate(endDate.getDate() + membership.duration);
        const today = new Date();
        
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        const totalDays = membership.duration;
        const progressPercent = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));

        card.innerHTML = `
            <div class="card-info">
                <h2 class="platform-name">${membership.platform}</h2>
                <div class="dates">
                    <div>
                        <label>开始：</label>
                        <input type="date" 
                            value="${membership.startDate}"
                            onchange="app.updateDates('${membership.id}', 'startDate', this.value)">
                    </div>
                    <div>
                        <label>时长：</label>
                        <input type="number" 
                            value="${membership.duration}"
                            min="1"
                            onchange="app.updateDates('${membership.id}', 'duration', this.value)">
                        <span>天</span>
                    </div>
                </div>
            </div>
            <div class="progress-section">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="days-left">
                    <span>${daysLeft}</span> 天
                </div>
            </div>
            <div class="controls">
                <button class="btn-lock" onclick="app.toggleLock('${membership.id}')">
                    <span class="lock-icon">${membership.isLocked ? '🔒' : '🔓'}</span>
                </button>
                <button class="btn-delete" onclick="app.deleteMembership('${membership.id}')">
                    ❌
                </button>
            </div>
        `;

        if (membership.isLocked) {
            card.classList.add('locked');
        }

        this.cardsGrid.appendChild(card);
    }

    toggleLock(id) {
        const membership = this.memberships.get(id);
        if (!membership) return;

        membership.isLocked = !membership.isLocked;
        const card = document.getElementById(`card-${id}`);
        card.classList.toggle('locked', membership.isLocked);
        card.querySelector('.lock-icon').textContent = membership.isLocked ? '🔒' : '🔓';
        
        this.saveData();
    }

    deleteMembership(id) {
        const membership = this.memberships.get(id);
        if (!membership || membership.isLocked) return;

        if (confirm(`确定要删除 ${membership.platform} 的会员卡片吗？`)) {
            this.memberships.delete(id);
            document.getElementById(`card-${id}`).remove();
            this.saveData();
        }
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('zh-CN');
    }

    saveData() {
        const data = Array.from(this.memberships.values());
        localStorage.setItem('memberships', JSON.stringify(data));
    }

    loadSavedData() {
        const savedData = localStorage.getItem('memberships');
        if (savedData) {
            const memberships = JSON.parse(savedData);
            memberships.forEach(membership => {
                this.memberships.set(membership.id, membership);
                this.createMembershipCard(membership);
            });
        }
    }

    // 定时更新所有卡片的剩余天数
    startAutoUpdate() {
        setInterval(() => {
            this.memberships.forEach(membership => {
                const card = document.getElementById(`card-${membership.id}`);
                if (card) {
                    const endDate = new Date(membership.startDate);
                    endDate.setDate(endDate.getDate() + membership.duration);
                    const today = new Date();
                    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                    const totalDays = membership.duration;
                    const progressPercent = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));

                    card.querySelector('.days-left span').textContent = daysLeft;
                    card.querySelector('.progress-fill').style.width = `${progressPercent}%`;
                }
            });
        }, 1000 * 60 * 60); // 每小时更新一次
    }

    updateDates(id, field, value) {
        const membership = this.memberships.get(id);
        if (!membership || membership.isLocked) return;

        if (field === 'startDate') {
            membership.startDate = value;
        } else if (field === 'duration') {
            membership.duration = parseInt(value);
        }

        // 更新显示
        const card = document.getElementById(`card-${id}`);
        if (card) {
            const endDate = new Date(membership.startDate);
            endDate.setDate(endDate.getDate() + membership.duration);
            const today = new Date();
            const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            const totalDays = membership.duration;
            const progressPercent = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));

            // 更新进度条和剩余天数
            card.querySelector('.progress-fill').style.width = `${progressPercent}%`;
            card.querySelector('.days-left span').textContent = daysLeft;
        }

        this.saveData();
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MembershipCountdown();
    app.startAutoUpdate();
}); 