import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../hooks/useOrders';
import { Mail, Home, Phone, MapPin, CreditCard, CheckCircle2, X } from 'lucide-react';

export const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { createOrder, loading: ordersLoading } = useOrders();

  const [step, setStep] = useState('form');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    payment: 'pix',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (value) => {
    setForm({ ...form, payment: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Informe seu nome completo');
      return;
    }
    if (!form.phone.trim()) {
      setError('Informe seu telefone');
      return;
    }
    if (!form.address.trim()) {
      setError('Informe seu endereço de entrega');
      return;
    }
    if (items.length === 0) {
      setError('Carrinho vazio');
      return;
    }

    setSubmitting(true);

    try {
      const deliveryFee = 5.90;
      const orderData = {
        payment_method: form.payment,
        subtotal: Number(total.toFixed(2)),
        delivery_fee: deliveryFee,
        total: Number((total + deliveryFee).toFixed(2)),
        status: 'pending',
        payment_status: 'pending',
        notes: `Nome: ${form.name.trim()}\nTelefone: ${form.phone.trim()}\nEndereço: ${form.address.trim()}`,
      };

      const cartItems = items.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        product_options: item.selectedOptions || [],
      }));

      const { error: orderError, data } = await createOrder(orderData, cartItems);

      if (orderError) throw orderError;

      clearCart();
      setStep('success');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = [
    { id: 'pix', label: 'PIX', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'cartao', label: 'Cartão de Crédito', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'dinheiro', label: 'Dinheiro na Entrega', icon: <CreditCard className="w-5 h-5" /> },
  ];

  if (step === 'success') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido confirmado!</h2>
          <p className="text-gray-600 mb-6">
            Obrigado, {form.name}. Seu pedido está sendo preparado.
          </p>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Total</span>
              <span className="font-semibold">R$ {Number((total + 5.90).toFixed(2)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span>Pagamento</span>
              <span>
                {paymentMethods.find((m) => m.id === form.payment)?.label || form.payment}
              </span>
            </div>
          </div>
          <button
            onClick={() => { setStep('form'); navigate('/'); }}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" /> Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <nav className="flex items-center gap-2 mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1"
        >
          <X className="w-4 h-4" /> Voltar
        </button>
        <span className="w-2 h-2 rounded-full bg-gray-300" />
        <span className="text-sm font-medium text-gray-600">Finalizar Pedido</span>
      </nav>

      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Dados da Entrega</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex: Maria Silva"
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="(11) 99999-9999"
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço de entrega <span className="text-red-500">*</span>
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Rua, número, bairro, complemento..."
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forma de pagamento <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      form.payment === method.id
                        ? 'bg-primary-50 border-primary-200'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={form.payment === method.id}
                      onChange={() => handlePaymentChange(method.id)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div className="flex items-center gap-2">
                      {method.icon}
                      <span className="text-sm font-medium text-gray-700">{method.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Entrega</span>
                <span>R$ 5,90</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 mt-2">
                <span>Total</span>
                <span>R$ {Number((total + 5.90).toFixed(2)).toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finalizando...
                </span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" /> Finalizar Pedido
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
