// ============================================
// 현장 사진 업로드 앱 - Firebase 연동
// ============================================

// Firebase 설정 (field-photo 프로젝트)
const firebaseConfig = {
  apiKey: "AIzaSyBNhJq9nvHPXxTPo54Zd3LqVWQslOjLW-M",
  authDomain: "field-photo.firebaseapp.com",
  projectId: "field-photo",
  storageBucket: "field-photo.firebasestorage.app",
  messagingSenderId: "522484967053",
  appId: "1:522484967053:web:b08e01cfa75079478aa4c4",
  measurementId: "G-Z1CLE192CP"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

console.log('🔥 Firebase 초기화 완료!');
console.log('📦 프로젝트:', firebaseConfig.projectId);
console.log('☁️ Storage:', firebaseConfig.storageBucket);

// 전역 변수
let selectedPhotos = []; // 최대 4장
let currentLocationData = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 페이지 로드 완료');
    console.log('🔍 Firebase 연결 상태 확인...');
    
    // Firebase Storage 연결 테스트
    try {
        const testRef = storage.ref('test');
        console.log('✅ Firebase Storage 연결 성공');
    } catch (error) {
        console.error('❌ Firebase Storage 연결 실패:', error);
    }
    
    // Firestore 연결 테스트
    db.collection('photoUploads').limit(1).get()
        .then(() => {
            console.log('✅ Firestore 연결 성공');
            updateDebugInfo('firestore', true);
        })
        .catch(error => {
            console.error('❌ Firestore 연결 실패:', error);
            updateDebugInfo('firestore', false);
            showNotification('⚠️ 데이터베이스 연결 실패. Firebase 설정을 확인하세요.', 'error');
        });
    
    updateDebugInfo('storage', true);
    
    setupEventListeners();
    setupLocationListener();
    tryGetCurrentLocation();
    
    // 디버그 정보 표시 (URL에 ?debug 추가 시)
    if (window.location.search.includes('debug')) {
        document.getElementById('debugInfo').style.display = 'block';
    }
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 사진 선택 input
    document.getElementById('photoInput').addEventListener('change', handlePhotoSelection);
    
    // 업로드 버튼
    document.getElementById('uploadBtn').addEventListener('click', handleUpload);
    
    // 드래그 앤 드롭 지원
    const photoGrid = document.getElementById('photoGrid');
    photoGrid.addEventListener('dragover', handleDragOver);
    photoGrid.addEventListener('drop', handleDrop);
}

// 사진 선택 처리
function handlePhotoSelection(event) {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    console.log(`📸 ${files.length}개 파일 선택됨`);
    
    // 이미지 파일만 필터링
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        showNotification('이미지 파일만 선택해주세요.', 'error');
        return;
    }
    
    // 4장을 초과하지 않도록
    const availableSlots = 4 - selectedPhotos.length;
    const filesToAdd = imageFiles.slice(0, availableSlots);
    
    if (imageFiles.length > availableSlots) {
        showNotification(`최대 4장까지만 선택할 수 있습니다. ${filesToAdd.length}장이 추가됩니다.`, 'warning');
    }
    
    // 파일 추가
    filesToAdd.forEach(file => addPhoto(file));
    
    // input 초기화 (같은 파일 재선택 가능)
    event.target.value = '';
}

// 사진 추가
function addPhoto(file) {
    if (selectedPhotos.length >= 4) {
        showNotification('최대 4장까지만 선택할 수 있습니다.', 'error');
        return;
    }
    
    // 파일 크기 확인 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
        showNotification(`${file.name}은(는) 너무 큽니다. 10MB 이하의 파일을 선택해주세요.`, 'error');
        return;
    }
    
    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = function(e) {
        const photoData = {
            file: file,
            preview: e.target.result,
            name: file.name,
            size: file.size
        };
        
        selectedPhotos.push(photoData);
        updatePhotoGrid();
        updatePhotoCount();
        updateUploadButton();
        
        console.log(`✅ 사진 추가: ${file.name} (${formatFileSize(file.size)})`);
    };
    reader.readAsDataURL(file);
}

// 사진 그리드 업데이트
function updatePhotoGrid() {
    const photoGrid = document.getElementById('photoGrid');
    const slots = photoGrid.querySelectorAll('.photo-slot');
    
    slots.forEach((slot, index) => {
        if (index < selectedPhotos.length) {
            // 사진이 있는 슬롯
            const photo = selectedPhotos[index];
            slot.classList.remove('empty');
            slot.classList.add('filled');
            slot.innerHTML = `
                <img src="${photo.preview}" alt="사진 ${index + 1}">
                <button class="delete-btn" onclick="removePhoto(${index})" title="삭제">
                    ❌
                </button>
                <div class="photo-info">
                    <span class="photo-name">${truncateFileName(photo.name, 15)}</span>
                    <span class="photo-size">${formatFileSize(photo.size)}</span>
                </div>
            `;
        } else {
            // 빈 슬롯
            slot.classList.remove('filled');
            slot.classList.add('empty');
            slot.innerHTML = `
                <div class="slot-content">
                    <span class="slot-icon">📷</span>
                    <span class="slot-number">${index + 1}</span>
                </div>
            `;
        }
    });
}

// 사진 삭제
function removePhoto(index) {
    if (index < 0 || index >= selectedPhotos.length) return;
    
    const photo = selectedPhotos[index];
    console.log(`🗑️ 사진 삭제: ${photo.name}`);
    
    selectedPhotos.splice(index, 1);
    updatePhotoGrid();
    updatePhotoCount();
    updateUploadButton();
    
    showNotification('사진이 삭제되었습니다.');
}

// 사진 개수 업데이트
function updatePhotoCount() {
    document.getElementById('photoCount').textContent = selectedPhotos.length;
    updateDebugInfo('photoCount', selectedPhotos.length);
}

// 디버그 정보 업데이트
function updateDebugInfo(type, value) {
    if (type === 'storage') {
        const elem = document.getElementById('storageStatus');
        if (elem) {
            elem.textContent = value ? '✅ 연결됨' : '❌ 실패';
            elem.style.color = value ? 'green' : 'red';
        }
    } else if (type === 'firestore') {
        const elem = document.getElementById('firestoreStatus');
        if (elem) {
            elem.textContent = value ? '✅ 연결됨' : '❌ 실패';
            elem.style.color = value ? 'green' : 'red';
        }
    } else if (type === 'photoCount') {
        const elem = document.getElementById('debugPhotoCount');
        if (elem) {
            elem.textContent = value;
        }
    }
}

// 업로드 버튼 상태 업데이트
function updateUploadButton() {
    const uploadBtn = document.getElementById('uploadBtn');
    const workerName = document.getElementById('workerName').value.trim();
    const projectName = document.getElementById('projectName').value.trim();
    
    // 4장의 사진과 필수 정보가 모두 입력되었는지 확인
    if (selectedPhotos.length === 4 && workerName && projectName) {
        uploadBtn.disabled = false;
        uploadBtn.classList.add('active');
    } else {
        uploadBtn.disabled = true;
        uploadBtn.classList.remove('active');
    }
}

// 입력 필드 변경 감지
document.addEventListener('input', function(e) {
    if (e.target.id === 'workerName' || e.target.id === 'projectName') {
        updateUploadButton();
    }
});

// 업로드 처리
async function handleUpload() {
    if (selectedPhotos.length !== 4) {
        showNotification('정확히 4장의 사진을 선택해주세요.', 'error');
        return;
    }
    
    const workerName = document.getElementById('workerName').value.trim();
    const projectName = document.getElementById('projectName').value.trim();
    const workNote = document.getElementById('workNote').value.trim();
    const locationData = document.getElementById('locationData').value;
    const location = locationData ? JSON.parse(locationData) : null;
    
    if (!workerName || !projectName) {
        showNotification('작업자 이름과 프로젝트명을 입력해주세요.', 'error');
        return;
    }
    
    // 업로드 버튼 비활성화
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = '업로드 중...';
    
    // 진행률 표시
    showProgress();
    updateProgress(5); // 초기 진행률
    
    try {
        console.log('📤 업로드 시작...');
        
        // 타임스탬프 생성 (폴더명 및 파일명에 사용)
        const timestamp = Date.now();
        const dateFolder = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const uploadId = `${timestamp}_${workerName}`;
        
        updateProgress(10); // 준비 완료
        
        // 각 사진을 Firebase Storage에 업로드 (진행률 추적)
        const photoUrls = [];
        const progressPerPhoto = 60 / selectedPhotos.length; // 10%~70% 범위에서 사진 업로드
        const startProgress = 10;
        
        for (let index = 0; index < selectedPhotos.length; index++) {
            const photo = selectedPhotos[index];
            const fileName = `photo_${index + 1}_${timestamp}.jpg`;
            const filePath = `photos/${dateFolder}/${projectName}/${uploadId}/${fileName}`;
            const storageRef = storage.ref(filePath);
            
            console.log(`📤 사진 ${index + 1}/${selectedPhotos.length} 업로드 중...`);
            
            // 업로드 시작
            const snapshot = await storageRef.put(photo.file);
            const downloadUrl = await snapshot.ref.getDownloadURL();
            
            photoUrls.push(downloadUrl);
            
            // 진행률 업데이트 (각 사진 업로드 완료 시)
            const currentProgress = Math.round(startProgress + (index + 1) * progressPerPhoto);
            updateProgress(currentProgress);
            console.log(`✅ 사진 ${index + 1} 업로드 완료 (${currentProgress}%)`);
        }
        
        updateProgress(70);
        console.log('✅ 모든 사진 업로드 완료');
        
        // Firestore에 메타데이터 저장
        updateProgress(85);
        console.log('💾 메타데이터 저장 중...');
        
        const uploadData = {
            workerName: workerName,
            projectName: projectName,
            workNote: workNote || '',
            location: location,
            photoUrls: photoUrls,
            photoCount: photoUrls.length,
            uploadDate: new Date().toISOString(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            dateFolder: dateFolder,
            uploadId: uploadId
        };
        
        const docRef = await db.collection('photoUploads').add(uploadData);
        
        updateProgress(100);
        console.log('✅ 메타데이터 저장 완료:', docRef.id);
        
        // 성공 처리
        setTimeout(() => {
            hideProgress();
            showNotification('✅ 업로드가 완료되었습니다!', 'success');
            
            // 폼 초기화
            resetForm();
            
            // 2초 후 갤러리로 이동
            setTimeout(() => {
                window.location.href = 'gallery.html';
            }, 2000);
        }, 500);
        
    } catch (error) {
        console.error('❌ 업로드 실패:', error);
        console.error('에러 상세:', error.message);
        console.error('에러 코드:', error.code);
        
        hideProgress();
        
        let errorMessage = '업로드에 실패했습니다. ';
        
        // 에러 타입별 메시지
        if (error.code === 'storage/unauthorized') {
            errorMessage += 'Firebase Storage 권한이 없습니다. 보안 규칙을 확인하세요.';
        } else if (error.code === 'storage/canceled') {
            errorMessage += '업로드가 취소되었습니다.';
        } else if (error.code === 'storage/unknown') {
            errorMessage += '알 수 없는 오류가 발생했습니다.';
        } else if (error.code === 'permission-denied') {
            errorMessage += 'Firestore 권한이 없습니다. 보안 규칙을 확인하세요.';
        } else {
            errorMessage += '다시 시도해주세요.';
        }
        
        showNotification(errorMessage, 'error');
        
        // 버튼 복구
        uploadBtn.disabled = false;
        uploadBtn.textContent = '⬆️ 사진 업로드하기';
    }
}

// 폼 초기화
function resetForm() {
    selectedPhotos = [];
    document.getElementById('workerName').value = '';
    document.getElementById('projectName').value = '';
    document.getElementById('workNote').value = '';
    document.getElementById('locationInfo').value = '';
    document.getElementById('locationData').value = '';
    
    updatePhotoGrid();
    updatePhotoCount();
    updateUploadButton();
    
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = '⬆️ 사진 업로드하기';
}

// 진행률 표시
function showProgress() {
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.style.display = 'block';
    // 초기값은 호출하는 쪽에서 설정
}

function updateProgress(percent) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = Math.round(percent) + '%';
}

function hideProgress() {
    document.getElementById('progressContainer').style.display = 'none';
}

// ============================================
// 위치 관련 함수
// ============================================

// 현재 위치 자동 가져오기
function tryGetCurrentLocation() {
    if (!navigator.geolocation) {
        console.log('ℹ️ 위치 서비스를 지원하지 않습니다.');
        return;
    }
    
    console.log('📍 현재 위치 가져오는 중...');
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude.toFixed(6);
            const lon = position.coords.longitude.toFixed(6);
            
            currentLocationData = { lat, lon, address: '현재 위치' };
            
            document.getElementById('locationInfo').value = `📍 현재 위치 (위도: ${lat}, 경도: ${lon})`;
            document.getElementById('locationData').value = JSON.stringify(currentLocationData);
            
            console.log('✅ 현재 위치 자동 설정:', lat, lon);
        },
        function(error) {
            console.warn('⚠️ 위치 정보를 가져올 수 없습니다:', error.message);
        },
        {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000
        }
    );
}

// 지도 창 열기
function openLocationMap() {
    console.log('🗺️ 지도 창 열기');
    
    const width = 800;
    const height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    const mapWindow = window.open(
        'map.html',
        'LocationMap',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    if (!mapWindow) {
        showNotification('지도 창을 열 수 없습니다. 팝업 차단을 해제해주세요.', 'error');
    }
}

// 지도에서 위치 정보 받기
function receiveLocation(location) {
    console.log('📍 위치 정보 수신:', location);
    
    if (!location || !location.lat || !location.lon) {
        showNotification('위치 정보가 올바르지 않습니다.', 'error');
        return;
    }
    
    currentLocationData = location;
    
    let displayText = `위도: ${location.lat}, 경도: ${location.lon}`;
    if (location.address) {
        displayText = `📍 ${location.address}`;
    }
    
    document.getElementById('locationInfo').value = displayText;
    document.getElementById('locationData').value = JSON.stringify(location);
    
    showNotification('위치 정보가 설정되었습니다! 📍');
}

// localStorage를 통한 위치 정보 수신 감지
function setupLocationListener() {
    console.log('🎧 위치 정보 리스너 설정');
    
    // 주기적으로 localStorage 확인
    setInterval(function() {
        try {
            const savedLocation = localStorage.getItem('selectedLocation');
            const timestamp = localStorage.getItem('locationTimestamp');
            
            if (savedLocation && timestamp) {
                const now = Date.now();
                const savedTime = parseInt(timestamp, 10);
                
                // 5초 이내에 저장된 데이터만 유효
                if (now - savedTime < 5000) {
                    const location = JSON.parse(savedLocation);
                    console.log('📥 localStorage에서 위치 정보 감지:', location);
                    
                    receiveLocation(location);
                    
                    // 처리된 데이터 제거
                    localStorage.removeItem('selectedLocation');
                    localStorage.removeItem('locationTimestamp');
                }
            }
        } catch (e) {
            // localStorage 접근 오류 무시
        }
    }, 500);
    
    // storage 이벤트 리스너
    window.addEventListener('storage', function(e) {
        if (e.key === 'selectedLocation' && e.newValue) {
            try {
                const location = JSON.parse(e.newValue);
                receiveLocation(location);
            } catch (error) {
                console.error('❌ storage 이벤트 처리 오류:', error);
            }
        }
    });
}

// ============================================
// 드래그 앤 드롭
// ============================================

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        showNotification('이미지 파일만 추가할 수 있습니다.', 'error');
        return;
    }
    
    const availableSlots = 4 - selectedPhotos.length;
    const filesToAdd = imageFiles.slice(0, availableSlots);
    
    filesToAdd.forEach(file => addPhoto(file));
}

// ============================================
// 유틸리티 함수
// ============================================

// 파일 크기 포맷
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 파일명 줄임
function truncateFileName(name, maxLength) {
    if (name.length <= maxLength) return name;
    const ext = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - ext.length - 4) + '...';
    return truncated + '.' + ext;
}

// 알림 메시지 표시
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
        word-wrap: break-word;
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

console.log('🚀 사진 업로드 앱 초기화 완료!');

