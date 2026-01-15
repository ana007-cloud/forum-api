/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumn('comments', {
    date: {
      type: 'TEXT',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('comments', 'date');
};
