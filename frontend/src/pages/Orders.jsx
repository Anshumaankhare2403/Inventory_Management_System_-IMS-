import React, { useState, useEffect } from 'react';
import { Plus, Eye, ShoppingCart, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Loader from '../components/Loader';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Form State
  const [orderType, setOrderType] = useState('Sales');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordRes, prodRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products')
      ]);
      setOrders(ordRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setOrderType('Sales');
    setSelectedItems([]);
    setIsModalOpen(true);
  };

  const openViewModal = async (id) => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setCurrentOrder(data);
      setIsViewModalOpen(true);
    } catch (error) {
      toast.error('Could not fetch order details');
    }
  };

  const handleAddItem = () => {
    setSelectedItems([
      ...selectedItems, 
      { product_id: '', quantity: 1, unit_price: 0, stock_quantity: 0 }
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...selectedItems];
    
    if (field === 'product_id') {
      const product = products.find(p => p.id.toString() === value.toString());
      if (product) {
        newItems[index].product_id = product.id;
        newItems[index].unit_price = orderType === 'Sales' ? product.price : product.cost_price;
        newItems[index].stock_quantity = product.stock_quantity;
        newItems[index].max_quantity = product.stock_quantity; // useful for validation on Sales
      } else {
        newItems[index].product_id = '';
        newItems[index].unit_price = 0;
      }
    } else {
      newItems[index][field] = Number(value);
    }
    
    setSelectedItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      return toast.error('Please add at least one item');
    }
    
    // Validation
    const invalidItems = selectedItems.filter(item => !item.product_id || item.quantity <= 0);
    if (invalidItems.length > 0) {
      return toast.error('Check product selection and quantities');
    }

    if (orderType === 'Sales') {
      const outOfStock = selectedItems.find(item => item.quantity > item.max_quantity);
      if (outOfStock) {
        return toast.error(`Insufficient stock for selected items (max ${outOfStock.max_quantity})`);
      }
    }

    setIsSubmitting(true);
    try {
      await api.post('/orders', {
        type: orderType,
        items: selectedItems
      });
      toast.success('Order placed successfully');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" /> Create Order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">#{o.id}</td>
                  <td className="px-6 py-4">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      o.type === 'Sales' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {o.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{o.created_by || 'Admin'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-xs font-medium">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800">
                    ₹{o.total_amount}
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    <button onClick={() => openViewModal(o.id)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-md transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                       <ShoppingCart size={32} className="text-gray-300 mb-2"/>
                       <p>No orders history found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ORDER MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Order">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input type="radio" value="Sales" checked={orderType === 'Sales'} onChange={() => setOrderType('Sales')} className="mr-2 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                Sales (Stock Out)
              </label>
              <label className="flex items-center">
                <input type="radio" value="Purchase" checked={orderType === 'Purchase'} onChange={() => setOrderType('Purchase')} className="mr-2 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                Purchase (Stock In)
              </label>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">Order Items</h4>
              <button type="button" onClick={handleAddItem} className="text-sm bg-white border px-3 py-1 rounded-md hover:bg-gray-100 transition-colors flex items-center">
                <Plus size={14} className="mr-1"/> Add Row
              </button>
            </div>
            
            {selectedItems.map((item, index) => (
              <div key={index} className="flex space-x-2 items-end mb-3 bg-white p-2 rounded-md border border-gray-100 shadow-sm">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Product</label>
                  <select 
                    required 
                    value={item.product_id} 
                    onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                    className="w-full px-2 py-1.5 border rounded text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select Product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stock_quantity}) {orderType === 'Sales' ? `- ₹${p.price}` : `- ₹${p.cost_price}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className="block text-xs text-gray-500 mb-1">Qty</label>
                  <input 
                    type="number" 
                    min="1" 
                    required 
                    value={item.quantity} 
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-2 py-1.5 border rounded text-sm focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-500 mb-1">Price</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    required 
                    value={item.unit_price} 
                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                    className="w-full px-2 py-1.5 border rounded text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50" 
                  />
                </div>
                <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md mb-0.5">
                  <X size={18} />
                </button>
              </div>
            ))}
            {selectedItems.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">No items added to this order yet.</p>
            )}
            
            <div className="text-right mt-4 pt-3 border-t font-semibold text-lg">
              Total: ₹{calculateTotal().toFixed(2)}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-gray-100 border-opacity-50">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" disabled={isSubmitting || selectedItems.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
              {isSubmitting ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW ORDER MODAL */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Order #${currentOrder?.id}`}>
        {currentOrder && (
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className={`font-semibold ${currentOrder.type === 'Sales' ? 'text-green-600' : 'text-blue-600'}`}>{currentOrder.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-800">{new Date(currentOrder.created_at).toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Items</h4>
              <ul className="divide-y divide-gray-100 bg-gray-50 rounded-lg border">
                {currentOrder.items?.map(item => (
                  <li key={item.id} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{item.product_name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} x ₹{item.unit_price}</p>
                    </div>
                    <div className="font-semibold text-sm">
                      ₹{item.total_price}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
              <span>Total Amount</span>
              <span className="text-blue-600">₹{currentOrder.total_amount}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
