// 데이터 저장소
let questions = [];
let currentQuestionId = null;

// 로컬 스토리지 키
const STORAGE_KEY = 'qna_board_data';

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    displayQuestions();
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 질문 등록 폼
    document.getElementById('questionForm').addEventListener('submit', handleQuestionSubmit);
    
    // 답변 등록 폼
    document.getElementById('answerForm').addEventListener('submit', handleAnswerSubmit);
    
    // 필터 변경
    document.getElementById('filterSubject').addEventListener('change', displayQuestions);
    
    // 모달 닫기
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('answerModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// 질문 등록 처리
function handleQuestionSubmit(e) {
    e.preventDefault();
    
    const question = {
        id: Date.now(),
        subject: document.getElementById('subject').value,
        title: document.getElementById('questionTitle').value,
        content: document.getElementById('questionContent').value,
        author: document.getElementById('authorName').value,
        date: new Date().toISOString(),
        answers: []
    };
    
    questions.unshift(question); // 최신 질문을 맨 앞에 추가
    saveToLocalStorage();
    displayQuestions();
    
    // 폼 초기화
    document.getElementById('questionForm').reset();
    
    // 성공 메시지
    showNotification('질문이 등록되었습니다!');
}

// 답변 등록 처리
function handleAnswerSubmit(e) {
    e.preventDefault();
    
    const answer = {
        id: Date.now(),
        content: document.getElementById('answerContent').value,
        author: document.getElementById('answerAuthor').value,
        date: new Date().toISOString()
    };
    
    const question = questions.find(q => q.id === currentQuestionId);
    if (question) {
        question.answers.push(answer);
        saveToLocalStorage();
        displayAnswers(currentQuestionId);
        
        // 폼 초기화
        document.getElementById('answerForm').reset();
        
        // 질문 목록도 업데이트 (답변 수 변경)
        displayQuestions();
        
        // 성공 메시지
        showNotification('답변이 등록되었습니다!');
    }
}

// 질문 목록 표시
function displayQuestions() {
    const filter = document.getElementById('filterSubject').value;
    const questionsList = document.getElementById('questionsList');
    
    let filteredQuestions = questions;
    if (filter !== 'all') {
        filteredQuestions = questions.filter(q => q.subject === filter);
    }
    
    if (filteredQuestions.length === 0) {
        questionsList.innerHTML = '<div class="empty-message">등록된 질문이 없습니다.</div>';
        return;
    }
    
    questionsList.innerHTML = filteredQuestions.map(question => `
        <div class="question-card" onclick="openQuestionModal(${question.id})">
            <div class="question-header">
                <div class="question-title">${escapeHtml(question.title)}</div>
                <span class="subject-badge">${escapeHtml(question.subject)}</span>
            </div>
            <div class="question-content">${escapeHtml(question.content)}</div>
            <div class="question-meta">
                <span class="author-info">
                    👤 ${escapeHtml(question.author)} · ${formatDate(question.date)}
                </span>
                <span class="answer-count">답변 ${question.answers.length}개</span>
            </div>
        </div>
    `).join('');
}

// 질문 모달 열기
function openQuestionModal(questionId) {
    currentQuestionId = questionId;
    const question = questions.find(q => q.id === questionId);
    
    if (!question) return;
    
    // 질문 내용 표시
    document.getElementById('modalQuestionContent').innerHTML = `
        <div class="question-header">
            <div class="question-title">${escapeHtml(question.title)}</div>
            <span class="subject-badge">${escapeHtml(question.subject)}</span>
        </div>
        <div class="question-content">${escapeHtml(question.content)}</div>
        <div class="question-meta">
            <span class="author-info">
                👤 ${escapeHtml(question.author)} · ${formatDate(question.date)}
            </span>
        </div>
    `;
    
    // 답변 목록 표시
    displayAnswers(questionId);
    
    // 모달 열기
    document.getElementById('answerModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 답변 목록 표시
function displayAnswers(questionId) {
    const question = questions.find(q => q.id === questionId);
    const answersList = document.getElementById('answersList');
    
    if (!question || question.answers.length === 0) {
        answersList.innerHTML = '<div class="empty-message">아직 답변이 없습니다. 첫 번째 답변을 작성해보세요!</div>';
        return;
    }
    
    answersList.innerHTML = question.answers.map(answer => `
        <div class="answer-card">
            <div class="answer-content">${escapeHtml(answer.content)}</div>
            <div class="answer-meta">
                <span>👤 ${escapeHtml(answer.author)}</span>
                <span>${formatDate(answer.date)}</span>
            </div>
        </div>
    `).join('');
}

// 모달 닫기
function closeModal() {
    document.getElementById('answerModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('answerForm').reset();
    currentQuestionId = null;
}

// 로컬 스토리지에 저장
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
}

// 로컬 스토리지에서 불러오기
function loadFromLocalStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            questions = JSON.parse(data);
        } catch (e) {
            console.error('데이터 로드 실패:', e);
            questions = [];
        }
    }
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 알림 메시지 표시
function showNotification(message) {
    // 간단한 알림 표시
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// 애니메이션 CSS 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

