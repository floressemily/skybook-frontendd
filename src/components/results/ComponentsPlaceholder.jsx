import React from 'react';

const Placeholder = ({ name }) => (
  <div className="component-placeholder">
    <h3>{name} Component</h3>
    <p>Esperando implementación del usuario...</p>
  </div>
);

export const SearchEditBar = () => <Placeholder name="SearchEditBar" />;
export const FiltersSidebar = () => <Placeholder name="FiltersSidebar" />;
export const SortTabs = () => <Placeholder name="SortTabs" />;
export const FlightResultsList = () => <Placeholder name="FlightResultsList" />;
export const FlightCard = () => <Placeholder name="FlightCard" />;
export const LegalNotes = () => <Placeholder name="LegalNotes" />;
