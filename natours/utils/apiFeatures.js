class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedQueries = ['page', 'limit', 'sort', 'fields'];
    //BUILD query
    excludedQueries.forEach((queryName) => delete queryObj[queryName]);
    this.query = this.query.find(queryObj);
    return this;
  }

  sort() {
    // sorting
    if (this.queryString.sort) {
      const sortQueries = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortQueries);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limit() {
    if (this.queryString.fields) {
      const selectedFields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(selectedFields);
    } else {
      //exclude _v from response
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
