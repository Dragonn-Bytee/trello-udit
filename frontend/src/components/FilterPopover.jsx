import { FiX } from 'react-icons/fi';

export default function FilterPopover({ labels, members, filters, onFilterChange, onClose }) {
  const toggleLabelFilter = (labelId) => {
    const newLabels = filters.labels.includes(labelId)
      ? filters.labels.filter((id) => id !== labelId)
      : [...filters.labels, labelId];
    onFilterChange({ ...filters, labels: newLabels });
  };

  const toggleMemberFilter = (memberId) => {
    const newMembers = filters.members.includes(memberId)
      ? filters.members.filter((id) => id !== memberId)
      : [...filters.members, memberId];
    onFilterChange({ ...filters, members: newMembers });
  };

  const toggleDueFilter = (due) => {
    onFilterChange({ ...filters, due: filters.due === due ? null : due });
  };

  const clearFilters = () => {
    onFilterChange({ labels: [], members: [], due: null });
  };

  return (
    <>
      <div className="popover-overlay" onClick={onClose} />
      <div className="popover" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4 }}>
        <div className="popover-header">
          <h4>Filter</h4>
          <button className="popover-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="popover-body">
          {/* Labels filter */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 8 }}>Labels</div>
            {labels.map((label) => (
              <div
                key={label.id}
                className="label-picker-item"
                onClick={() => toggleLabelFilter(label.id)}
                style={{ marginBottom: 4 }}
              >
                <div className="label-picker-color" style={{ backgroundColor: label.color }}>
                  {label.name}
                </div>
                <div className="label-picker-check">
                  {filters.labels.includes(label.id) ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>

          {/* Members filter */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 8 }}>Members</div>
            {members.map((member) => (
              <div
                key={member.id}
                className="member-picker-item"
                onClick={() => toggleMemberFilter(member.id)}
              >
                <div className="avatar avatar-sm" style={{ background: member.avatar_color }}>
                  {member.initials}
                </div>
                <span style={{ flex: 1 }}>{member.full_name}</span>
                {filters.members.includes(member.id) && <span>✓</span>}
              </div>
            ))}
          </div>

          {/* Due date filter */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 8 }}>Due Date</div>
            {[
              { key: 'overdue', label: 'Overdue', color: '#EB5A46' },
              { key: 'soon', label: 'Due soon', color: '#F2D600' },
              { key: 'complete', label: 'Complete', color: '#61BD4F' },
            ].map((item) => (
              <div
                key={item.key}
                className="member-picker-item"
                onClick={() => toggleDueFilter(item.key)}
              >
                <span
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: item.color, display: 'inline-block',
                  }}
                />
                <span style={{ flex: 1 }}>{item.label}</span>
                {filters.due === item.key && <span>✓</span>}
              </div>
            ))}
          </div>

          <button className="btn btn-subtle" style={{ width: '100%' }} onClick={clearFilters}>
            Clear all filters
          </button>
        </div>
      </div>
    </>
  );
}
