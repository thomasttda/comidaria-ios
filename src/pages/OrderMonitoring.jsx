import { useState, useEffect, useRef } from 'react';
import { useOrders } from '../hooks/useOrders';
import { Bell, RefreshCw } from 'lucide-react';

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

const STATUS_LABEL = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  out_for_delivery: 'A caminho',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const STATUS_COLOR = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  ready: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

let audioCtx = null;

const playNotificationSound = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(440, now + 0.15);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(660, now + 0.22);
    osc2.frequency.exponentialRampToValueAtTime(330, now + 0.37);
    gain2.gain.setValueAtTime(0.12, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.42);
  } catch (e) {
    console.warn('Áudio não suportado:', e);
  }
};

export const OrderMonitoring = () => {
  const { orders, loading, refetch, updateOrderStatus } = useOrders();
  const [polling, setPolling] = useState(true);
  const prevOrderIds = useRef(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 8000);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    if (!orders || orders.length === 0) return;
    const currentIds = new Set(orders.map((o) => o.id));
    if (prevOrderIds.current.size > 0) {
      const newOrders = orders.filter((o) => !prevOrderIds.current.has(o.id));
      if (newOrders.length > 0) {
        playNotificationSound();
      }
    }
    prevOrderIds.current = currentIds;
  }, [orders]);

  const handleStatusChange = async (id, status) => {
    await updateOrderStatus(id, status);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando pedidos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitoramento de Pedidos</h2>
          <p className="text-gray-500 text-sm">Acompanhe todos os pedidos em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
          <button
            onClick={() => { setPolling(!polling); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${polling ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
            title={polling ? 'Desativar monitoramento automático' : 'Ativar monitoramento automático'}
          >
            <Bell className={`w-4 h-4 ${polling ? 'text-white' : 'text-gray-400'}`} />
            <span>{polling ? 'Áudio: ligado' : 'Áudio: desligado'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Pedido</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Cliente</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Data</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase text-right">Itens</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase text-right">Valor</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((order) => {
                const status = order.status || 'pending';
                const itemCount = order.order_items?.length || 0;
                return (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                    <td className="py-4 font-medium text-gray-900">{order.id}</td>
                    <td className="py-4 text-gray-600">{order.user?.full_name || 'Cliente'}</td>
                    <td className="py-4 text-gray-600 text-sm">{new Date(order.created_at).toLocaleString('pt-BR')}</td>
                    <td className="py-4 text-right text-gray-600 text-sm">{itemCount}</td>
                    <td className="py-4 text-right font-medium text-gray-900">R$ {Number(order.total || 0).toFixed(2)}</td>
                    <td className="py-4">
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500 outline-none bg-gray-50"
                      >
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-400 text-sm">Nenhum pedido encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{orders.filter((o) => o.status === 'pending').length}</div>
          <div className="text-xs text-gray-500 mt-1">Pendentes</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="text-2xl font-bold text-orange-600">{orders.filter((o) => o.status === 'preparing').length}</div>
          <div className="text-xs text-gray-500 mt-1">Preparando</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="text-2xl font-bold text-indigo-600">{orders.filter((o) => o.status === 'out_for_delivery').length}</div>
          <div className="text-xs text-gray-500 mt-1">A caminho</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{orders.filter((o) => o.status === 'delivered').length}</div>
          <div className="text-xs text-gray-500 mt-1">Entregues</div>
        </div>
      </div>
    </div>
  );
};
