import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Shield, Trash2, Users, AlertTriangle, CheckCircle, User, Crown, Activity } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

interface AdminAction {
  id: string;
  action_type: string;
  target_user_id?: string;
  details: any;
  created_at: string;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [createAdminLoading, setCreateAdminLoading] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      
      setIsAdmin(data);
      
      if (data) {
        await fetchAdminData();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      // 管理者ユーザー一覧取得
      const { data: admins, error: adminsError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (adminsError) throw adminsError;
      setAdminUsers(admins || []);

      // 管理者アクション履歴取得
      const { data: actions, error: actionsError } = await supabase
        .from('admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (actionsError) throw actionsError;
      setAdminActions(actions || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleDeleteAllData = async () => {
    setDeleteLoading(true);
    try {
      const { data, error } = await supabase.rpc('delete_all_database_data');
      
      if (error) throw error;
      
      alert(`データベース全体のデータを削除しました。\n削除されたレコード数: ${JSON.stringify(data.deleted_counts, null, 2)}`);
      setShowDeleteConfirm(false);
      await fetchAdminData();
    } catch (error: any) {
      console.error('Error deleting all data:', error);
      alert(`エラーが発生しました: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    setCreateAdminLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_admin_user', {
        user_email: newAdminEmail.trim(),
        admin_role: 'admin'
      });
      
      if (error) throw error;
      
      alert(`管理者ユーザーを作成しました: ${newAdminEmail}`);
      setNewAdminEmail('');
      await fetchAdminData();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      alert(`エラーが発生しました: ${error.message}`);
    } finally {
      setCreateAdminLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">管理者権限を確認中...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">アクセス拒否</h1>
          <p className="text-gray-600">
            このページにアクセスするには管理者権限が必要です。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">管理者パネル</h1>
              <p className="text-gray-600">システム管理とデータ操作</p>
            </div>
          </div>

          {/* 危険な操作セクション */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-red-800">危険な操作</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-red-800 mb-2">データベース全体のデータ削除</h3>
                <p className="text-sm text-red-700 mb-3">
                  ⚠️ この操作は取り消せません。すべてのユーザーデータが完全に削除されます。
                </p>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    全データ削除
                  </button>
                ) : (
                  <div className="bg-white border border-red-300 rounded-md p-4">
                    <p className="text-red-800 font-medium mb-3">
                      本当にすべてのデータを削除しますか？
                    </p>
                    <p className="text-sm text-red-700 mb-4">
                      この操作により、すべてのユーザー、タスク、プロジェクト、サブスクリプションデータが完全に削除されます。
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleDeleteAllData}
                        disabled={deleteLoading}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                      >
                        {deleteLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            削除中...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            はい、削除します
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleteLoading}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 管理者ユーザー管理 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-blue-800">管理者ユーザー管理</h2>
            </div>
            
            {/* 新しい管理者の追加 */}
            <form onSubmit={handleCreateAdmin} className="mb-4">
              <div className="flex space-x-3">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="管理者にするユーザーのメールアドレス"
                  className="flex-1 p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={createAdminLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {createAdminLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      作成中...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      管理者に追加
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* 管理者一覧 */}
            <div className="space-y-2">
              {adminUsers.map(admin => (
                <div key={admin.id} className="bg-white border border-blue-200 rounded-md p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">{admin.email}</p>
                      <p className="text-sm text-gray-600">
                        役割: {admin.role} | 
                        作成日: {new Date(admin.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {admin.role === 'super_admin' && (
                      <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      admin.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.is_active ? 'アクティブ' : '無効'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 管理者アクション履歴 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Activity className="w-6 h-6 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">管理者アクション履歴</h2>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {adminActions.map(action => (
                <div key={action.id} className="bg-white border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">
                      {action.action_type === 'delete_all_data' && '全データ削除'}
                      {action.action_type === 'delete_user_data' && 'ユーザーデータ削除'}
                      {action.action_type === 'create_admin' && '管理者作成'}
                      {action.action_type === 'deactivate_admin' && '管理者無効化'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(action.created_at).toLocaleString('ja-JP')}
                    </span>
                  </div>
                  {action.details && (
                    <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(action.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
              
              {adminActions.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  管理者アクションの履歴はありません
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;