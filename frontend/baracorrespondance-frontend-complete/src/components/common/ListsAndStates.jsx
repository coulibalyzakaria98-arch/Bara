import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import '../styles/lists-and-states.css';

/**
 * EmptyState Component
 * Affiche un état vide attrayant
 */
export const EmptyState = ({
  icon = '📭',
  title = 'Aucun résultat',
  description = 'Aucune donnée disponible pour le moment',
  action = null,
  className = ''
}) => (
  <div className={`empty-state ${className}`}>
    <div className="empty-state-icon">{icon}</div>
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-description">{description}</p>
    {action && <div className="empty-state-action">{action}</div>}
  </div>
);

/**
 * ListGroup Component
 * Affiche une liste groupée avec en-tête
 */
export const ListGroup = ({
  title,
  items = [],
  renderItem,
  emptyState = null,
  className = ''
}) => (
  <div className={`list-group ${className}`}>
    {title && <div className="list-group-header">{title}</div>}
    {items.length === 0 ? (
      emptyState || (
        <EmptyState
          icon="📋"
          title="Liste vide"
          description="Aucun élément à afficher"
        />
      )
    ) : (
      items.map((item, index) => (
        <div key={item.id || index} className="list-group-item">
          {renderItem(item)}
        </div>
      ))
    )}
  </div>
);

/**
 * GridList Component
 * Affiche une grille d'éléments
 */
export const GridList = ({
  items = [],
  renderItem,
  emptyState = null,
  columns = 3,
  className = ''
}) => (
  <div
    className={`grid-list ${className}`}
    style={{
      '--grid-columns': columns
    }}
  >
    {items.length === 0 ? (
      emptyState || (
        <EmptyState
          icon="🎯"
          title="Pas d'éléments"
          description="Aucun élément à afficher en grille"
        />
      )
    ) : (
      items.map((item, index) => (
        <div key={item.id || index} className="grid-list-item">
          {renderItem(item)}
        </div>
      ))
    )}
  </div>
);

/**
 * Timeline Component
 * Affiche une chronologie d'événements
 */
export const Timeline = ({
  items = [],
  renderItem,
  emptyState = null,
  className = ''
}) => (
  <div className={`timeline ${className}`}>
    {items.length === 0 ? (
      emptyState || (
        <EmptyState
          icon="📅"
          title="Chronologie vide"
          description="Aucun événement à afficher"
        />
      )
    ) : (
      items.map((item, index) => (
        <div key={item.id || index} className="timeline-item">
          <div className="timeline-item-dot" />
          <div className="timeline-item-content">
            {renderItem(item)}
          </div>
        </div>
      ))
    )}
  </div>
);

/**
 * Accordion Component
 * Affiche un accordion d'éléments pliables
 */
export const Accordion = ({
  items = [],
  allowMultiple = false,
  className = ''
}) => {
  const [openItems, setOpenItems] = useState({});

  const handleToggle = (id) => {
    if (allowMultiple) {
      setOpenItems(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    } else {
      setOpenItems(Object.keys(openItems).length > 0 ? {} : { [id]: true });
    }
  };

  return (
    <div className={`accordion ${className}`}>
      {items.map((item) => (
        <div key={item.id} className="accordion-item">
          <button
            className={`accordion-trigger ${openItems[item.id] ? 'active' : ''}`}
            onClick={() => handleToggle(item.id)}
          >
            <span>{item.title}</span>
            <div className="accordion-icon">
              <ChevronDown size={20} />
            </div>
          </button>
          {openItems[item.id] && (
            <div className="accordion-content">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Breadcrumb Component
 * Affiche un fil d'Ariane
 */
export const Breadcrumb = ({
  items = [],
  className = ''
}) => (
  <nav className={`breadcrumb ${className}`}>
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <span className="breadcrumb-separator">/</span>}
        <span className={`breadcrumb-item ${item.active ? 'active' : ''}`}>
          {item.href ? (
            <a href={item.href}>{item.label}</a>
          ) : (
            item.label
          )}
        </span>
      </React.Fragment>
    ))}
  </nav>
);

/**
 * Pagination Component
 * Affiche la pagination
 */
export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = ''
}) => {
  const pages = [];
  const maxVisible = 5;
  const halfVisible = Math.floor(maxVisible / 2);

  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={`pagination ${className}`}>
      <button
        className="pagination-button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        «
      </button>
      <button
        className="pagination-button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ‹
      </button>

      {startPage > 1 && (
        <>
          <button
            className="pagination-button"
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {startPage > 2 && <span style={{ padding: '0 0.5rem' }}>...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          className={`pagination-button ${page === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span style={{ padding: '0 0.5rem' }}>...</span>}
          <button
            className="pagination-button"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className="pagination-button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        ›
      </button>
      <button
        className="pagination-button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
      >
        »
      </button>
    </div>
  );
};

/**
 * SearchableList Component
 * Liste avec recherche intégrée
 */
export const SearchableList = ({
  items = [],
  renderItem,
  filterFn = (item, query) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()),
  placeholder = 'Rechercher...',
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = searchQuery
    ? items.filter(item => filterFn(item, searchQuery))
    : items;

  return (
    <div className={`searchable-list ${className}`}>
      <div className="form-input-group" style={{ marginBottom: '1.5rem' }}>
        <Search size={18} className="input-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input form-input-with-icon"
        />
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={searchQuery ? '🔍' : '📭'}
          title={searchQuery ? 'Aucun résultat' : 'Liste vide'}
          description={
            searchQuery
              ? `Aucun résultat pour "${searchQuery}"`
              : 'Aucun élément à afficher'
          }
        />
      ) : (
        <div className="list">
          {filteredItems.map((item, index) => (
            <div key={item.id || index} className="list-item">
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default {
  EmptyState,
  ListGroup,
  GridList,
  Timeline,
  Accordion,
  Breadcrumb,
  Pagination,
  SearchableList
};
