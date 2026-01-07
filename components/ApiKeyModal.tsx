
import React, { useState } from 'react';
import { testApiKey } from '../services/geminiService';

interface ApiKeyModalProps {
  onSuccess: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSuccess }) => {
  const [keyInput, setKeyInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!keyInput.trim()) {
      setError("API 키를 입력해주세요.");
      return;
    }
    setIsValidating(true);
    setError(null);
    
    const isValid = await testApiKey(keyInput);
    if (isValid) {
      onSuccess(keyInput);
    } else {
      setError("유효하지 않은 API 키이거나 연결에 실패했습니다. 키를 확인하고 다시 시도해주세요.");
    }
    setIsValidating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          제미나이 API 활성화
        </h2>
        <p className="text-slate-300 mb-6 text-sm">
          AI가 강화된 숫자 맞추기 게임을 시작하려면 Google Gemini API 키를 입력해주세요.
          입력하신 키로 간단한 통신 테스트를 진행합니다.
        </p>
        
        <div className="space-y-4">
          <input
            type="password"
            placeholder="AIza..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          
          {error && <p className="text-red-400 text-xs">{error}</p>}
          
          <button
            onClick={handleValidate}
            disabled={isValidating}
            className={`w-full py-3 rounded-lg font-bold transition-all ${
              isValidating 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-95 shadow-lg shadow-blue-500/20'
            }`}
          >
            {isValidating ? '연결 확인 중...' : '검증 및 게임 시작'}
          </button>
        </div>
        
        <p className="mt-6 text-[10px] text-slate-500 text-center">
          입력하신 키는 브라우저 통신을 위해서만 로컬에서 사용됩니다.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;
