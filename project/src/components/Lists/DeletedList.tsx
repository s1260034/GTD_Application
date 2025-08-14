import React from 'react';
import { useTaskContext } from '../../contexts/TaskContext';
import TaskItem from '../common/TaskItem';
import { Trash2, Clock, AlertTriangle, RotateCcw } from 'lucide-react';

const DeletedList: React.FC = () => {
  const { getTasksByStatus, permanentlyDeleteAllTasks, restoreAllTasks, restoreTask } = useTaskContext();
  const deletedTasks = getTasksByStatus('deleted');
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);

  const handlePermanentDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await permanentlyDeleteAllTasks();
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error deleting all tasks:', error);
      alert('削除中にエラーが発生しました。');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreAll = async () => {
    setIsRestoring(true);
    try {
      await restoreAllTasks();
      setShowRestoreDialog(false);
    } catch (error) {
      console.error('Error restoring all tasks:', error);
      alert('復元中にエラーが発生しました。');
    } finally {
      setIsRestoring(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Trash2 className="w-6 h-6 mr-2 text-red-500" />
          ゴミ箱
        </h1>
        <p className="text-gray-600">
          削除したタスクの一覧
        </p>
        
        {deletedTasks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setShowRestoreDialog(true)}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              全て復元
            </button>
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              全て削除
            </button>
          </div>
        )}
      </div>
      
      {deletedTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">ゴミ箱は空です</h3>
          <p className="text-gray-500 max-w-md">
            削除したタスクはここに表示されます。
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            削除済みタスク ({deletedTasks.length})
          </h2>
          <div className="space-y-3">
            {deletedTasks.map(task => (
              <div key={task.id} className="relative">
                <TaskItem
                  task={task}
                  showControls={false}
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => restoreTask(task.id)}
                    className="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    title="インボックスに復元"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 復元確認ダイアログ */}
      {showRestoreDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  全ての削除済みタスクを復元
                </h2>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                ゴミ箱内の全てのタスク（{deletedTasks.length}個）をインボックスに復元します。
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700">
                  復元されたタスクはインボックスに移動し、再度処理できるようになります。
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowRestoreDialog(false)}
                disabled={isRestoring}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleRestoreAll}
                disabled={isRestoring}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isRestoring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    復元中...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    全て復元
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 復元確認ダイアログ */}
      {showRestoreDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  全ての削除済みタスクを復元
                </h2>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                ゴミ箱内の全てのタスク（{deletedTasks.length}個）をインボックスに復元します。
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700">
                  復元されたタスクはインボックスに移動し、再度処理できるようになります。
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowRestoreDialog(false)}
                disabled={isRestoring}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleRestoreAll}
                disabled={isRestoring}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isRestoring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    復元中...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    全て復元
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  全ての削除済みタスクを完全削除
                </h2>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                ゴミ箱内の全てのタスク（{deletedTasks.length}個）を完全に削除します。
                この操作は取り消すことができません。
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">
                  <strong>警告:</strong> 削除されたデータは復元できません。本当に実行しますか？
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handlePermanentDeleteAll}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    削除中...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    完全削除
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

      {/* 完全削除確認ダイアログ */}
export default DeletedList;