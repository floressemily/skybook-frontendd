// src/pages/Payment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { crearMetodoPago, crearPago } from '../services/pagoService';
import { crearReserva, crearReservaPasajero } from '../services/reservaService';
import { crearPasajero } from '../services/pasajeroService';
import { calcularPrecio } from '../utils/precioUtils';

import PaymentMethodTabs from '../components/payment/PaymentMethodTabs';
import PaymentForm from '../components/payment/PaymentForm';
import VirtualCard from '../components/payment/VirtualCard';
import PaymentSummary from '../components/payment/PaymentSummary';
import SecurityBadges from '../components/payment/SecurityBadges';

import '../styles/payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const { user, cliente: authCliente } = useAuth();
  const { vueloSeleccionado, asientoSeleccionado, setReserva, setPago } = useBooking();
  
  const [vueloInfo, setVueloInfo] = useState(null);
  const [asientoInfo, setAsientoInfo] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('visa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // DEBUG: Ver qué campos traen realmente
  useEffect(() => {
    console.log('--- AUTH DEBUG FULL ---');
    console.log('User Object:', JSON.stringify(user, null, 2));
    console.log('Cliente Object:', JSON.stringify(authCliente, null, 2));
    console.log('------------------------');
  }, [user, authCliente]);

  // ClienteId prioritario: buscar en todas las variantes posibles (PascalCase y camelCase)
  const effectiveClienteId = 
    authCliente?.clienteId || authCliente?.ClienteId || 
    user?.clienteId || user?.ClienteId || 
    user?.usuarioAppId || user?.UsuarioAppId || 1;
  
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    email: user?.email || authCliente?.email || ''
  });

  // Cargar datos de contexto o sessionStorage
  useEffect(() => {
    console.log('Auth DEBUG - User Object:', user);
    console.log('Auth DEBUG - Cliente Object:', authCliente);

    let vuelo = vueloSeleccionado;
    let asiento = asientoSeleccionado;

    if (!vuelo) {
      const storedVuelo = sessionStorage.getItem('booking_vuelo');
      if (storedVuelo) {
        vuelo = JSON.parse(storedVuelo);
      } else {
        navigate('/results');
        return;
      }
    }

    if (!asiento) {
      const storedAsiento = sessionStorage.getItem('booking_asiento');
      if (storedAsiento) {
        asiento = JSON.parse(storedAsiento);
      }
    }

    setVueloInfo(vuelo);
    setAsientoInfo(asiento);
  }, [vueloSeleccionado, asientoSeleccionado, navigate]);

  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    setIsProcessing(true);

    try {
      const precioBase = Number(vueloInfo.precioBase) || calcularPrecio(vueloInfo.ruta ?? vueloInfo) || 0;
      const precioAsiento = asientoInfo ? (Number(asientoInfo.precioAdicional) || 0) : 0;
      const impuestos = precioBase * 0.12;
      const total = precioBase + precioAsiento + impuestos;

      // Generar PNR simulado para la reserva
      const pnr = 'UI' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      let reservaReal = null;
      let reservaPasajeroReal = null;
      let metodoPagoReal = null;
      let pagoReal = null;

      console.log('ClienteId Debug:', authCliente?.clienteId, user?.clienteId, 'Effective:', effectiveClienteId);

      try {
        // 1. Crear Reserva
        const reservaPayload = {
          ClienteId: effectiveClienteId,
          VueloId: vueloInfo.vueloId || vueloInfo.VueloId,
          PNR: pnr,
          EstadoReserva: 'CONFIRMADA',
          TarifaBase: precioBase + precioAsiento,
          Tasas: impuestos,
          Descuentos: 0,
          Total: total
        };
        console.log('Payload Reserva:', reservaPayload);
        reservaReal = await crearReserva(reservaPayload);
        console.log('Reserva creada:', reservaReal);

        // 1.5 Crear Pasajero
        let pasajeroId = 1;
        try {
          const names = formData.cardholderName.trim().split(' ');
          const pasajeroPayload = {
            ClienteId: effectiveClienteId,
            Nombre: names[0] || 'Pasajero',
            Apellido: names.length > 1 ? names.slice(1).join(' ') : 'Prueba',
            FechaNacimiento: '1990-01-01T00:00:00',
            Genero: 'MASCULINO',
            Nacionalidad: 'Ecuatoriana',
            TipoPasajero: 'ADULTO',
            TipoDocumento: 'CEDULA',
            NumeroDocumento: '09' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
            PaisEmisorDocumento: 'Ecuador',
            Frecuente: false,
            Activo: true
          };
          console.log('Payload Pasajero:', pasajeroPayload);
          const pasajeroCreado = await crearPasajero(pasajeroPayload);
          pasajeroId = pasajeroCreado?.pasajeroId || pasajeroCreado?.PasajeroId || 1;
          console.log('Pasajero ID:', pasajeroId);
        } catch (e) {
          console.warn('No se pudo crear el pasajero dinámico, usando 1 por defecto', e);
        }

        // 2. Crear ReservaPasajero (Asignar asiento al pasajero)
        const reservaPasajeroPayload = {
          ReservaId: reservaReal.reservaId || reservaReal.ReservaId,
          PasajeroId: pasajeroId,
          AsientoVueloId: asientoInfo ? (asientoInfo.asientoVueloId || asientoInfo.AsientoVueloId) : null,
          PrecioPasajero: precioBase + precioAsiento,
          Estado: 'CONFIRMADO'
        };
        console.log('Payload ReservaPasajero:', reservaPasajeroPayload);
        reservaPasajeroReal = await crearReservaPasajero(reservaPasajeroPayload);
        console.log('ReservaPasajero creada:', reservaPasajeroReal);

        // 3. Crear Método de Pago
        const [mesExp, anioExp] = formData.expiryDate.split('/');
        const metodoPagoPayload = {
          ClienteId: effectiveClienteId,
          TipoPago: selectedMethod.toUpperCase(),
          Titular: formData.cardholderName,
          TokenPasarela: 'tok_' + Math.random().toString(36).substring(7),
          Ultimos4: formData.cardNumber.replace(/\s/g, '').slice(-4),
          Marca: selectedMethod.toUpperCase(),
          MesExpiracion: mesExp,
          AnioExpiracion: anioExp,
          Predeterminado: true,
          Activo: true
        };
        console.log('Payload MetodoPago:', metodoPagoPayload);
        metodoPagoReal = await crearMetodoPago(metodoPagoPayload);
        console.log('Método Pago creado:', metodoPagoReal);

        // 4. Crear Pago
        const pagoPayload = {
          ReservaId: reservaReal.reservaId || reservaReal.ReservaId,
          MetodoPagoId: metodoPagoReal.metodoPagoId || metodoPagoReal.MetodoPagoId,
          NumeroTransaccion: 'TRX' + Math.floor(Math.random() * 1000000),
          Resultado: 'APROBADA',
          Subtotal: precioBase + precioAsiento,
          Impuestos: impuestos,
          CargoServicio: 0,
          MontoTotal: total,
          AutorizacionPasarela: 'AUTH' + Math.floor(Math.random() * 10000),
          RespuestaPasarela: 'Aprobado por banco simulado'
        };
        console.log('Payload Pago:', pagoPayload);
        pagoReal = await crearPago(pagoPayload);
        console.log('Pago creado:', pagoReal);

      } catch (err) {
        console.log('Error detalle:', err.response?.data || err.message || err);
        const errorMsg = err.response?.data?.message || err.message || 'Error desconocido en el servidor';
        throw new Error(errorMsg);
      }

      // Guardar en contexto para la página de confirmación
      setReserva({
        ReservaId: reservaReal?.reservaId || reservaReal?.ReservaId,
        CodigoReserva: reservaReal?.pnr || reservaReal?.PNR || pnr,
        Total: total,
        Estado: 'Confirmada',
        email: formData.email
      });
      
      setPago({
        metodo: selectedMethod,
        total: total,
        tarjeta: formData.cardNumber.slice(-4)
      });

      // Guardar en sessionStorage para persistencia ante recargas
      sessionStorage.setItem('confirmacion_reserva', JSON.stringify({
        reservaId: reservaReal?.reservaId || reservaReal?.ReservaId,
        pnr: reservaReal?.pnr || reservaReal?.PNR || pnr,
        total: total,
        numeroVuelo: vueloInfo?.numeroVuelo || vueloInfo?.NumeroVuelo,
        aerolinea: vueloInfo?.aerolinea || vueloInfo?.Aerolinea,
        origen: vueloInfo?.origenNombre || vueloInfo?.OrigenNombre || vueloInfo?.ruta?.aeropuertoOrigenNombre,
        destino: vueloInfo?.destinoNombre || vueloInfo?.DestinoNombre || vueloInfo?.ruta?.aeropuertoDestinoNombre,
        email: formData.email,
        metodo: selectedMethod,
        tarjeta: formData.cardNumber.slice(-4),
        fecha: new Date().toISOString(),
        vueloInfo: vueloInfo,
        asientoInfo: asientoInfo
      }));

      // Navegar a confirmación
      setTimeout(() => {
        navigate('/confirmation');
      }, 500);

    } catch (error) {
      console.error('Error final handlePayment:', error);
      setPaymentError(error.message);
      setIsProcessing(false);
    }
  };

  if (!vueloInfo) return null;

  const precioBase = Number(vueloInfo.precioBase) || calcularPrecio(vueloInfo.ruta ?? vueloInfo) || 0;
  const precioAsiento = asientoInfo ? (Number(asientoInfo.precioAdicional) || 0) : 0;
  const impuestos = precioBase * 0.12;
  const total = precioBase + precioAsiento + impuestos;

  return (
    <div className="payment-page">
      <div className="payment-container">
        
        <main className="payment-main">
          <div className="payment-card">
            <h2 className="payment-card__title">Selecciona tu método de pago</h2>
            <PaymentMethodTabs 
              selectedMethod={selectedMethod} 
              onSelect={setSelectedMethod} 
            />
            
            <VirtualCard formData={formData} />
            
            <PaymentForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handlePayment} 
              isProcessing={isProcessing}
              total={total.toFixed(2)}
            />

            {paymentError && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                backgroundColor: '#FFF0F0', 
                border: '1px solid #FFCACA', 
                borderRadius: '8px',
                color: '#D32F2F',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⚠ {paymentError}
              </div>
            )}
            
            <SecurityBadges />
            
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#6A6A6A', marginTop: '16px' }}>
              * Esta es una pantalla de simulación de pago académico. No se realizarán cargos reales.
            </p>
          </div>
        </main>

        <aside className="payment-sidebar">
          <PaymentSummary vueloInfo={vueloInfo} asientoInfo={asientoInfo} />
        </aside>

      </div>
    </div>
  );
};

export default Payment;
