// ============================================
// 교과목 Q&A 게시판 - Firebase Firestore 연동
// 프로젝트: qna2-ljweng
// ============================================

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDurskwd1mnEvN84UpX344VALtZfO117IY",
  authDomain: "qna2-ljweng.firebaseapp.com",
  projectId: "qna2-ljweng",
  storageBucket: "qna2-ljweng.firebasestorage.app",
  messagingSenderId: "747102497355",
  appId: "1:747102497355:web:7e44d8a3bcb408a7767bce",
  measurementId: "G-G5D1RJH9ML"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firestore 데이터베이스 참조
const db = firebase.firestore();

console.log('Firebase 초기화 완료! 🔥');
console.log('프로젝트 ID:', firebaseConfig.projectId);

// 데이터 저장소
let questions = [];
let currentQuestionId = null;

// Firestore 컬렉션 참조
const questionsCollection = db.collection('questions');

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 페이지 로드 완료');
    loadFromFirestore();
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
async function handleQuestionSubmit(e) {
    e.preventDefault();
    
    const question = {
        subject: document.getElementById('subject').value,
        title: document.getElementById('questionTitle').value,
        content: document.getElementById('questionContent').value,
        author: document.getElementById('authorName').value,
        date: new Date().toISOString(),
        answers: [],
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        console.log('📝 질문 등록 시도:', question.title);
        
        // Firestore에 저장
        const docRef = await questionsCollection.add(question);
        question.id = docRef.id;
        
        console.log('✅ 질문 등록 성공:', docRef.id);
        
        // 폼 초기화
        document.getElementById('questionForm').reset();
        
        // 성공 메시지
        showNotification('질문이 등록되었습니다! 🎉');
        
        // 질문 목록 새로고침
        await loadFromFirestore();
    } catch (error) {
        console.error('❌ 질문 등록 실패:', error);
        showNotification('질문 등록에 실패했습니다. 다시 시도해주세요.', 'error');
    }
}

// 답변 등록 처리
async function handleAnswerSubmit(e) {
    e.preventDefault();
    
    const answer = {
        id: Date.now().toString(),
        content: document.getElementById('answerContent').value,
        author: document.getElementById('answerAuthor').value,
        date: new Date().toISOString()
    };
    
    try {
        console.log('💬 답변 등록 시도');
        
        // 현재 질문 찾기
        const question = questions.find(q => q.id === currentQuestionId);
        if (question) {
            // 답변 배열에 추가
            const updatedAnswers = [...(question.answers || []), answer];
            
            // Firestore 업데이트
            await questionsCollection.doc(currentQuestionId).update({
                answers: updatedAnswers
            });
            
            console.log('✅ 답변 등록 성공');
            
            // 로컬 데이터 업데이트
            question.answers = updatedAnswers;
            
            // 폼 초기화
            document.getElementById('answerForm').reset();
            
            // 답변 목록 표시
            displayAnswers(currentQuestionId);
            
            // 질문 목록도 업데이트 (답변 수 변경)
            displayQuestions();
            
            // 성공 메시지
            showNotification('답변이 등록되었습니다! 💬');
        }
    } catch (error) {
        console.error('❌ 답변 등록 실패:', error);
        showNotification('답변 등록에 실패했습니다. 다시 시도해주세요.', 'error');
    }
}

// Firestore에서 데이터 불러오기
async function loadFromFirestore() {
    try {
        console.log('📥 데이터 불러오기 시작...');
        
        const snapshot = await questionsCollection.orderBy('timestamp', 'desc').get();
        questions = [];
        
        snapshot.forEach(doc => {
            questions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ ${questions.length}개의 질문 로드 완료`);
        
        displayQuestions();
    } catch (error) {
        console.error('❌ 데이터 로드 실패:', error);
        console.error('에러 상세:', error.message);
        
        // 에러 발생 시 빈 배열 유지
        questions = [];
        displayQuestions();
        
        // Firestore 규칙 설정이 안 되어 있을 가능성
        if (error.code === 'permission-denied') {
            showNotification('❌ Firestore 보안 규칙을 설정해주세요!', 'error');
        }
    }
}

// 실시간 데이터 동기화 (선택사항)
function setupRealtimeListener() {
    console.log('🔄 실시간 동기화 활성화');
    
    questionsCollection.orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        questions = [];
        
        snapshot.forEach(doc => {
            questions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`🔄 실시간 업데이트: ${questions.length}개 질문`);
        displayQuestions();
    }, error => {
        console.error('❌ 실시간 동기화 오류:', error);
    });
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
        questionsList.innerHTML = '<div class="empty-message">등록된 질문이 없습니다. 첫 번째 질문을 작성해보세요! ✨</div>';
        return;
    }
    
    questionsList.innerHTML = filteredQuestions.map(question => `
        <div class="question-card" onclick="openQuestionModal('${question.id}')">
            <div class="question-header">
                <div class="question-title">${escapeHtml(question.title)}</div>
                <span class="subject-badge">${escapeHtml(question.subject)}</span>
            </div>
            <div class="question-content">${escapeHtml(question.content)}</div>
            <div class="question-meta">
                <span class="author-info">
                    👤 ${escapeHtml(question.author)} · ${formatDate(question.date)}
                </span>
                <span class="answer-count">답변 ${question.answers ? question.answers.length : 0}개</span>
            </div>
        </div>
    `).join('');
}

// 질문 모달 열기
function openQuestionModal(questionId) {
    currentQuestionId = questionId;
    const question = questions.find(q => q.id === questionId);
    
    if (!question) return;
    
    console.log('📖 질문 상세 열기:', question.title);
    
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
    
    if (!question || !question.answers || question.answers.length === 0) {
        answersList.innerHTML = '<div class="empty-message">아직 답변이 없습니다. 첫 번째 답변을 작성해보세요! 💡</div>';
        return;
    }
    
    answersList.innerHTML = question.answers.map(answer => `
        <div class="answer-card">
            <div class="answer-content">${escapeHtml(answer.content)}</div>
            <div class="answer-meta">
                <span>👤 ${escapeHtml(answer.author)}</span>
                <span>${formatDate(answer.date)}</span>
                <button class="btn-delete-answer" onclick="deleteAnswer('${answer.id}')" title="답변 삭제">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

// 답변 삭제 처리
async function deleteAnswer(answerId) {
    if (!currentQuestionId) {
        showNotification('삭제할 답변을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 삭제 확인
    if (!confirm('정말로 이 답변을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        console.log('🗑️ 답변 삭제 시도:', answerId);
        
        // 현재 질문 찾기
        const question = questions.find(q => q.id === currentQuestionId);
        if (question) {
            // 답변 배열에서 제거
            const updatedAnswers = (question.answers || []).filter(a => a.id !== answerId);
            
            // Firestore 업데이트
            await questionsCollection.doc(currentQuestionId).update({
                answers: updatedAnswers
            });
            
            console.log('✅ 답변 삭제 성공');
            
            // 로컬 데이터 업데이트
            question.answers = updatedAnswers;
            
            // 답변 목록 다시 표시
            displayAnswers(currentQuestionId);
            
            // 질문 목록도 업데이트 (답변 수 변경)
            displayQuestions();
            
            // 성공 메시지
            showNotification('답변이 삭제되었습니다.');
        }
    } catch (error) {
        console.error('❌ 답변 삭제 실패:', error);
        showNotification('답변 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
    }
}

// 질문 삭제 처리
async function deleteQuestion() {
    if (!currentQuestionId) {
        showNotification('삭제할 질문을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 삭제 확인
    if (!confirm('정말로 이 질문을 삭제하시겠습니까?\n삭제된 질문은 복구할 수 없습니다.')) {
        return;
    }
    
    try {
        console.log('🗑️ 질문 삭제 시도:', currentQuestionId);
        
        // Firestore에서 삭제
        await questionsCollection.doc(currentQuestionId).delete();
        
        console.log('✅ 질문 삭제 성공');
        
        // 로컬 데이터에서 제거
        questions = questions.filter(q => q.id !== currentQuestionId);
        
        // 성공 메시지
        showNotification('질문이 삭제되었습니다.');
        
        // 모달 닫기
        closeModal();
        
        // 질문 목록 새로고침
        displayQuestions();
    } catch (error) {
        console.error('❌ 질문 삭제 실패:', error);
        showNotification('질문 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
    }
}

// 모달 닫기
function closeModal() {
    document.getElementById('answerModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('answerForm').reset();
    currentQuestionId = null;
}

// 날짜 포맷팅
function formatDate(dateString) {
    if (!dateString) return '방금 전';
    
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
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 알림 메시지 표시
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const bgColor = type === 'error' 
        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
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

// 실시간 동기화 활성화 (원하는 경우 주석 해제)
// setupRealtimeListener();

console.log('🚀 Q&A 게시판 초기화 완료! (qna2-ljweng)');
