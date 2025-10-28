// ============================================
// 사진 갤러리 - Firebase 연동
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
const db = firebase.firestore();
const storage = firebase.storage();

console.log('🔥 Firebase 초기화 완료!');

// 전역 변수
let allUploads = [];
let filteredUploads = [];
let currentUploadId = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 페이지 로드 완료');
    loadGalleryData();
});

// 갤러리 데이터 로드
async function loadGalleryData() {
    try {
        console.log('📥 갤러리 데이터 로드 중...');
        
        const snapshot = await db.collection('photoUploads')
            .orderBy('timestamp', 'desc')
            .get();
        
        allUploads = [];
        
        snapshot.forEach(doc => {
            allUploads.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ ${allUploads.length}개 업로드 로드 완료`);
        
        filteredUploads = [...allUploads];
        updateStats();
        updateFilters();
        displayGallery();
        
    } catch (error) {
        console.error('❌ 데이터 로드 실패:', error);
        showError('데이터를 불러오는데 실패했습니다.');
    }
}

// 통계 업데이트
function updateStats() {
    const totalUploads = allUploads.length;
    const totalPhotos = allUploads.reduce((sum, upload) => sum + (upload.photoCount || 0), 0);
    const uniqueProjects = new Set(allUploads.map(upload => upload.projectName)).size;
    
    document.getElementById('totalUploads').textContent = totalUploads;
    document.getElementById('totalPhotos').textContent = totalPhotos;
    document.getElementById('totalProjects').textContent = uniqueProjects;
}

// 필터 옵션 업데이트
function updateFilters() {
    // 프로젝트 필터
    const projects = [...new Set(allUploads.map(u => u.projectName))].sort();
    const projectSelect = document.getElementById('filterProject');
    projectSelect.innerHTML = '<option value="all">전체</option>';
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project;
        option.textContent = project;
        projectSelect.appendChild(option);
    });
    
    // 작업자 필터
    const workers = [...new Set(allUploads.map(u => u.workerName))].sort();
    const workerSelect = document.getElementById('filterWorker');
    workerSelect.innerHTML = '<option value="all">전체</option>';
    workers.forEach(worker => {
        const option = document.createElement('option');
        option.value = worker;
        option.textContent = worker;
        workerSelect.appendChild(option);
    });
}

// 필터 적용
function applyFilters() {
    const projectFilter = document.getElementById('filterProject').value;
    const workerFilter = document.getElementById('filterWorker').value;
    const dateFilter = document.getElementById('filterDate').value;
    
    filteredUploads = allUploads.filter(upload => {
        // 프로젝트 필터
        if (projectFilter !== 'all' && upload.projectName !== projectFilter) {
            return false;
        }
        
        // 작업자 필터
        if (workerFilter !== 'all' && upload.workerName !== workerFilter) {
            return false;
        }
        
        // 날짜 필터
        if (dateFilter) {
            const uploadDate = upload.uploadDate ? upload.uploadDate.split('T')[0] : '';
            if (uploadDate !== dateFilter) {
                return false;
            }
        }
        
        return true;
    });
    
    console.log(`🔍 필터 적용: ${filteredUploads.length}개 결과`);
    displayGallery();
}

// 필터 초기화
function clearFilters() {
    document.getElementById('filterProject').value = 'all';
    document.getElementById('filterWorker').value = 'all';
    document.getElementById('filterDate').value = '';
    
    filteredUploads = [...allUploads];
    displayGallery();
}

// 갤러리 표시
function displayGallery() {
    const container = document.getElementById('galleryContainer');
    
    if (filteredUploads.length === 0) {
        container.innerHTML = '<div class="empty-message">📭 업로드된 사진이 없습니다.</div>';
        return;
    }
    
    container.innerHTML = filteredUploads.map(upload => {
        const uploadDate = formatDate(upload.uploadDate);
        const photoCount = upload.photoCount || 0;
        const firstPhotoUrl = upload.photoUrls && upload.photoUrls[0] ? upload.photoUrls[0] : '';
        
        // 썸네일 URL (Firebase Storage는 자동으로 최적화된 이미지를 제공하지 않으므로, 원본 사용)
        const thumbnailUrl = firstPhotoUrl;
        
        return `
            <div class="gallery-card" onclick="openUploadDetail('${upload.id}')">
                <div class="card-thumbnail">
                    ${thumbnailUrl ? 
                        `<img src="${thumbnailUrl}" alt="${upload.projectName}" loading="lazy">` :
                        `<div class="no-image">📷</div>`
                    }
                    <div class="photo-badge">${photoCount}장</div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${escapeHtml(upload.projectName)}</h3>
                    <div class="card-meta">
                        <div class="meta-item">
                            <span class="meta-icon">👤</span>
                            <span>${escapeHtml(upload.workerName)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-icon">📅</span>
                            <span>${uploadDate}</span>
                        </div>
                        ${upload.location ? 
                            `<div class="meta-item">
                                <span class="meta-icon">📍</span>
                                <span>위치 포함</span>
                            </div>` : ''
                        }
                    </div>
                    ${upload.workNote ? 
                        `<p class="card-note">${escapeHtml(upload.workNote)}</p>` : 
                        ''
                    }
                </div>
            </div>
        `;
    }).join('');
}

// 업로드 상세보기
function openUploadDetail(uploadId) {
    currentUploadId = uploadId;
    const upload = allUploads.find(u => u.id === uploadId);
    
    if (!upload) {
        showNotification('업로드 정보를 찾을 수 없습니다.', 'error');
        return;
    }
    
    console.log('📖 상세보기 열기:', upload.projectName);
    
    const uploadDate = formatDate(upload.uploadDate);
    
    // 위치 정보 HTML
    const locationHtml = upload.location ? 
        `<div class="detail-item">
            <strong>📍 위치:</strong> 
            <a href="#" onclick="viewLocationOnMap(${upload.location.lat}, ${upload.location.lon}); return false;" class="location-link">
                ${upload.location.address || `위도: ${upload.location.lat}, 경도: ${upload.location.lon}`}
            </a>
        </div>` : '';
    
    // 사진 그리드
    const photosHtml = upload.photoUrls && upload.photoUrls.length > 0 ?
        upload.photoUrls.map((url, index) => `
            <div class="photo-item" onclick="openPhotoViewer('${uploadId}', ${index})">
                <img src="${url}" alt="사진 ${index + 1}" loading="lazy">
                <div class="photo-number">${index + 1}</div>
            </div>
        `).join('') :
        '<p>사진이 없습니다.</p>';
    
    // 모달 내용
    const modalContent = `
        <div class="detail-header">
            <h2>${escapeHtml(upload.projectName)}</h2>
            <div class="detail-meta">
                <span class="meta-badge">👤 ${escapeHtml(upload.workerName)}</span>
                <span class="meta-badge">📅 ${uploadDate}</span>
                <span class="meta-badge">📷 ${upload.photoCount || 0}장</span>
            </div>
        </div>
        
        <div class="detail-body">
            ${upload.workNote ? 
                `<div class="detail-item">
                    <strong>📝 작업 메모:</strong>
                    <p>${escapeHtml(upload.workNote)}</p>
                </div>` : ''
            }
            
            ${locationHtml}
            
            <div class="detail-item">
                <strong>📸 사진:</strong>
                <div class="detail-photos">
                    ${photosHtml}
                </div>
            </div>
        </div>
        
        <div class="detail-actions">
            <button class="btn btn-danger" onclick="confirmDelete('${uploadId}')">
                🗑️ 삭제
            </button>
            <button class="btn btn-secondary" onclick="closePhotoModal()">
                닫기
            </button>
        </div>
    `;
    
    document.getElementById('modalContent').innerHTML = modalContent;
    document.getElementById('photoModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 사진 뷰어 열기 (확대 보기)
function openPhotoViewer(uploadId, photoIndex) {
    const upload = allUploads.find(u => u.id === uploadId);
    if (!upload || !upload.photoUrls) return;
    
    const photoUrl = upload.photoUrls[photoIndex];
    
    // 새 창으로 사진 열기
    window.open(photoUrl, '_blank');
}

// 삭제 확인
function confirmDelete(uploadId) {
    if (!confirm('정말로 이 업로드를 삭제하시겠습니까?\n사진과 모든 데이터가 삭제됩니다.')) {
        return;
    }
    
    deleteUpload(uploadId);
}

// 업로드 삭제
async function deleteUpload(uploadId) {
    try {
        console.log('🗑️ 업로드 삭제 시작:', uploadId);
        
        const upload = allUploads.find(u => u.id === uploadId);
        if (!upload) {
            showNotification('업로드 정보를 찾을 수 없습니다.', 'error');
            return;
        }
        
        // Storage에서 사진 삭제
        if (upload.photoUrls && upload.photoUrls.length > 0) {
            const deletePromises = upload.photoUrls.map(url => {
                const photoRef = storage.refFromURL(url);
                return photoRef.delete().catch(error => {
                    console.warn('⚠️ 사진 삭제 실패:', error);
                });
            });
            
            await Promise.all(deletePromises);
            console.log('✅ Storage에서 사진 삭제 완료');
        }
        
        // Firestore에서 메타데이터 삭제
        await db.collection('photoUploads').doc(uploadId).delete();
        console.log('✅ Firestore에서 메타데이터 삭제 완료');
        
        showNotification('삭제되었습니다.');
        closePhotoModal();
        
        // 데이터 새로고침
        await loadGalleryData();
        
    } catch (error) {
        console.error('❌ 삭제 실패:', error);
        showNotification('삭제에 실패했습니다. 다시 시도해주세요.', 'error');
    }
}

// 모달 닫기
function closePhotoModal() {
    document.getElementById('photoModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentUploadId = null;
}

// 지도에서 위치 보기
function viewLocationOnMap(lat, lon) {
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}&z=15`;
    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15`;
    
    const choice = confirm('위치를 확인하시겠습니까?\n\n확인: Google Maps\n취소: OpenStreetMap');
    
    window.open(
        choice ? googleMapsUrl : osmUrl,
        'ViewLocation',
        'width=800,height=600,resizable=yes,scrollbars=yes'
    );
}

// ============================================
// 유틸리티 함수
// ============================================

// 날짜 포맷
function formatDate(dateString) {
    if (!dateString) return '날짜 정보 없음';
    
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 에러 표시
function showError(message) {
    const container = document.getElementById('galleryContainer');
    container.innerHTML = `
        <div class="error-message">
            ❌ ${message}
            <br><br>
            <button class="btn btn-primary" onclick="loadGalleryData()">다시 시도</button>
        </div>
    `;
}

// 알림 메시지
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    const colors = {
        success: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        error: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        warning: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 90%;
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

// 애니메이션 CSS
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

// 모달 외부 클릭시 닫기
window.addEventListener('click', function(event) {
    const modal = document.getElementById('photoModal');
    if (event.target === modal) {
        closePhotoModal();
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePhotoModal();
    }
});

console.log('🚀 갤러리 초기화 완료!');

