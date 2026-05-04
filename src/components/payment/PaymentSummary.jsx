// src/components/payment/PaymentSummary.jsx
import React from 'react';
import { calcularPrecio } from '../../utils/precioUtils';

const formatMoney = (v) => {
  if (v == null) return null;
  const n = Number(v);
  if (isNaN(n)) return null;
  return `$${n.toFixed(2)}`;
};

const PaymentSummary = ({ vueloInfo, asientoInfo }) => {
  if (!vueloInfo) return null;

  const precioBase = Number(vueloInfo.precioBase) || calcularPrecio(vueloInfo.ruta ?? vueloInfo) || 0;
  const precioAsiento = asientoInfo ? (Number(asientoInfo.precioAdicional) || 0) : 0;
  const impuestos = precioBase * 0.12; // Simulando 12% de impuestos para la UI si no hay backend
  const total = precioBase + precioAsiento + impuestos;

  return (
    <div className="payment-summary">
      <h3 className="payment-summary__title">Resumen de compra</h3>
      
      <div className="payment-summary__flight">
        <div className="payment-summary__flight-route">
          {vueloInfo.origenIATA} - {vueloInfo.destinoIATA}
        </div>
        <div className="payment-summary__flight-date">
          {vueloInfo.aerolinea} • Vuelo {vueloInfo.numeroVuelo}
        </div>
        {asientoInfo && (
          <div className="payment-summary__flight-date" style={{ marginTop: '4px' }}>
            Asiento {asientoInfo.numeroAsiento}
          </div>
        )}
      </div>

      <div className="payment-summary__row">
        <span>Tarifa base</span>
        <span>{formatMoney(precioBase)}</span>
      </div>
      
      {asientoInfo && (
        <div className="payment-summary__row">
          <span>Selección de asiento</span>
          <span>{precioAsiento === 0 ? 'Sin costo' : formatMoney(precioAsiento)}</span>
        </div>
      )}

      <div className="payment-summary__row">
        <span>Tasas e impuestos</span>
        <span>{formatMoney(impuestos)}</span>
      </div>

      <div className="payment-summary__row payment-summary__row--total">
        <span>Total a pagar</span>
        <span>{formatMoney(total)}</span>
      </div>
    </div>
  );
};

export default PaymentSummary;
