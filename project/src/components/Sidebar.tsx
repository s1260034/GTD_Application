@@ .. @@
   const navItems = [
     {
       to: '/',
-      label: t('inbox'),
+      label: 'インボックス',
       icon: <Inbox className="w-5 h-5" />,
       color: 'text-gray-600',
       activeColor: 'bg-gray-100 text-gray-800',
@@ .. @@
     },
     {
       to: '/next',
-      label: t('nextActions'),
+      label: '次のアクション',
       icon: <ArrowRight className="w-5 h-5" />,
       color: 'text-blue-600',
       activeColor: 'bg-blue-100 text-blue-800',
@@ .. @@
     },
     {
       to: '/waiting',
-      label: 'Waiting For',
+      label: '待ち項目',
       icon: <User className="w-5 h-5" />,
       color: 'text-orange-600',
       activeColor: 'bg-orange-100 text-orange-800',
@@ .. @@
     },
     {
       to: '/scheduled',
-      label: 'Scheduled',
+      label: '予定済み',
       icon: <Calendar className="w-5 h-5" />,
       color: 'text-purple-600',
       activeColor: 'bg-purple-100 text-purple-800',
@@ .. @@
     },
     {
       to: '/projects',
-      label: 'Projects',
+      label: 'プロジェクト',
       icon: <Layers className="w-5 h-5" />,
       color: 'text-green-600',
       activeColor: 'bg-green-100 text-green-800',
@@ .. @@
     },
     {
       to: '/someday',
-      label: 'Someday/Maybe',
+      label: 'いつか/たぶん',
       icon: <Clock className="w-5 h-5" />,
       color: 'text-teal-600',
       activeColor: 'bg-teal-100 text-teal-800',
       count: counts.someday,
     },
   ];