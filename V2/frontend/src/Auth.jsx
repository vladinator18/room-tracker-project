import { useState } from 'react';
import { authApi } from './services/authApi';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        await authApi.signIn(email, password);
      } else {
        await authApi.signUp(email, password);
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8">
        
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Sign in to access the secure voting system
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-medium mb-4 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Secure Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Authenticate' : 'Register')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {isLogin ? "Request new account access" : "Return to authentication"}
          </button>
        </div>
      </div>
    </div>
  );
}