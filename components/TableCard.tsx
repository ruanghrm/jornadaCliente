// src/components/TableCard.tsx
import React from "react";

const TableCard: React.FC = () => {
  return (
    <div className="table-card">
      <div className="table-header">
        <h3>Últimos Registros</h3>
        <div className="table-actions">
          <button className="btn small"><i className="fa-solid fa-download"></i> Exportar</button>
          <button className="btn outline small"><i className="fa-solid fa-filter"></i> Filtrar</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Local</th>
              <th>Valor (MWh)</th>
              <th>Status</th>
              <th>Operador</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2025-10-10</td>
              <td>Usina Norte</td>
              <td>4.56</td>
              <td><span className="status ok">OK</span></td>
              <td>Marcos</td>
              <td>-</td>
            </tr>
            <tr>
              <td>2025-10-10</td>
              <td>Usina Sul</td>
              <td>3.21</td>
              <td><span className="status warn">Atenção</span></td>
              <td>Ana</td>
              <td>Leve queda</td>
            </tr>
            <tr>
              <td>2025-10-09</td>
              <td>Usina Oeste</td>
              <td>4.98</td>
              <td><span className="status ok">OK</span></td>
              <td>Ruan</td>
              <td>-</td>
            </tr>
            <tr>
              <td>2025-10-08</td>
              <td>Usina Leste</td>
              <td>2.11</td>
              <td><span className="status error">Falha</span></td>
              <td>Juliana</td>
              <td>Inversor offline</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableCard;
