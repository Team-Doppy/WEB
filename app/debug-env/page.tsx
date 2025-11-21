'use client';

export default function DebugEnvPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>환경 변수 디버깅</h1>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h2>환경 변수 상태:</h2>
        <p>
          <strong>NEXT_PUBLIC_API_URL:</strong>{' '}
          <span style={{ color: apiUrl ? 'green' : 'red', fontWeight: 'bold' }}>
            {apiUrl || '❌ 설정되지 않음'}
          </span>
        </p>
        <p>
          <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
        </p>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
        <h2>API 연결 테스트:</h2>
        <button
          onClick={async () => {
            if (!apiUrl) {
              alert('API URL이 설정되지 않았습니다!');
              return;
            }
            
            try {
              const testUrl = `${apiUrl}/web/api/posts/recommendation?page=0&size=1`;
              console.log('테스트 URL:', testUrl);
              
              const response = await fetch(testUrl);
              const data = await response.json();
              
              alert(`✅ API 연결 성공!\n상태: ${response.status}\n응답: ${JSON.stringify(data).substring(0, 100)}...`);
            } catch (error) {
              alert(`❌ API 연결 실패!\n${error instanceof Error ? error.message : String(error)}`);
              console.error('API 연결 오류:', error);
            }
          }}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          API 연결 테스트
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '5px' }}>
        <h2>설정 방법:</h2>
        <ol>
          <li>Vercel 대시보드 → 프로젝트 → Settings → Environment Variables</li>
          <li>Key: <code>NEXT_PUBLIC_API_URL</code></li>
          <li>Value: <code>https://api.doppy.app</code></li>
          <li>Environments: All Environments 선택</li>
          <li>Save 후 새 배포 필요</li>
        </ol>
      </div>
    </div>
  );
}

