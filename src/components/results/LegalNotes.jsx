// src/components/results/LegalNotes.jsx
const LegalNotes = () => (
    <div className="legal-notes">
        <p>
            Los precios mostrados son por persona e incluyen tasas e impuestos aplicables.
            Las tarifas pueden variar en función de la disponibilidad y pueden cambiar sin previo aviso.
        </p>
        <p>
            Los vuelos marcados como "Mix" combinan billetes de distintas aerolíneas.
            En caso de retraso, cada segmento es responsabilidad de su aerolínea.{' '}
            <a href="#">Más información</a>
        </p>
        <p style={{ marginTop: 8, color: '#999' }}>
            Datos de vuelos y escalas provistos por la API interna BookingVuelosDB.
            Precios con fines ilustrativos.
        </p>
    </div>
);

export default LegalNotes;