class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.pagination = {};
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let where = {};
    Object.keys(queryObj).forEach((key) => {
      if (queryObj[key] !== undefined && queryObj[key] !== '') {
        where[key] = queryObj[key];
      }
    });

    if (Object.keys(where).length > 0) {
      this.query = this.query.where(where);
    }

    return this;
  }

  search(searchFields = ['title']) {
    if (this.queryString.search) {
      const { Op } = require('sequelize');
      const searchConditions = searchFields.map((field) => ({
        [field]: { [Op.iLike]: `%${this.queryString.search}%` },
      }));
      this.query = this.query.where({ [Op.or]: searchConditions });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').map((field) => {
        const order = field.startsWith('-') ? 'DESC' : 'ASC';
        const name = field.replace('-', '');
        return [name, order];
      });
      this.query = this.query.order(sortBy);
    } else {
      this.query = this.query.order([['created_at', 'DESC']]);
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',');
      this.query = this.query.attributes(fields);
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const offset = (page - 1) * limit;

    this.query = this.query.limit(limit).offset(offset);
    this.pagination = { page, limit };

    return this;
  }

  async execute() {
    const { count, rows } = await this.query.findAndCountAll();
    return {
      results: rows,
      pagination: {
        ...this.pagination,
        total: count,
        pages: Math.ceil(count / this.pagination.limit),
      },
    };
  }
}

module.exports = ApiFeatures;
