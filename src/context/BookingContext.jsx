import { createContext, useState, useContext } from 'react';

export const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [vueloSeleccionado, setVueloSeleccionado] = useState(null);
  const [asientoSeleccionado, setAsientoSeleccionado] = useState(null);
  const [pasajeros, setPasajeros] = useState([]);
  const [reserva, setReserva] = useState(null);
  const [pago, setPago] = useState(null);
  const [boleto, setBoleto] = useState(null);
  const [factura, setFactura] = useState(null);

  const resetBooking = () => {
    setVueloSeleccionado(null);
    setAsientoSeleccionado(null);
    setPasajeros([]);
    setReserva(null);
    setPago(null);
    setBoleto(null);
    setFactura(null);
  };

  return (
    <BookingContext.Provider value={{
      vueloSeleccionado,
      setVueloSeleccionado,
      asientoSeleccionado,
      setAsientoSeleccionado,
      pasajeros,
      setPasajeros,
      reserva,
      setReserva,
      pago,
      setPago,
      boleto,
      setBoleto,
      factura,
      setFactura,
      resetBooking,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking debe usarse dentro de <BookingProvider>');
  return context;
};
