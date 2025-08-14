@@ .. @@
 import PricingModal from './components/Subscription/PricingModal';
 import SuccessPage from './components/Subscription/SuccessPage';
 import CancelPage from './components/Subscription/CancelPage';
 import UsageBanner from './components/Subscription/UsageBanner';
+import AdminPanel from './components/Admin/AdminPanel';

 function App() {
 }
@@ .. @@
                              <Route path="/reference" element={<ReferenceList />} />
                               <Route path="/completed" element={<CompletedList />} />
                               <Route path="/deleted" element={<DeletedList />} />
+                              <Route path="/admin" element={<AdminPanel />} />
                             </Routes>
                           </div>