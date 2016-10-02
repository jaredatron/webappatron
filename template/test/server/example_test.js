describe('example server test', () => {
  it('should test requests to the server', () => {
    return request('get', '/hello-world').then(response => {
      expect(response).to.have.status(200)
      expect(response.text).to.eql('Hello World')
    })
  })
})
