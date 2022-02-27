export const reactSelectStyle = {
  container: () => ({
    padding: '0',
    fontSize: '0.9rem',
    marginTop: '16px',
  }),
  valueContainer: (obj) => ({
    ...obj,
    marginLeft: '-2px',
  }),
  control: () => ({
    border: 'none',
    borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
  }),
  placeholder: (obj) => ({
    ...obj,
    marginLeft: '0',
  }),
};
