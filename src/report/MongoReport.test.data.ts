export const tracer = {
  'timestamp': 1523863489204,
  'duration': 15,
  'spans': [{
    'name': 'http-server',
    'timestamp': 1523863489205,
    'duration': 14,
    'context': {'traceId': '39560052a08deeb6', 'spanId': '87f7570d0e9edc64'},
    'references': [],
    'tags': {
      'http.method': {'value': 'GET', 'type': 'string'},
      'http.url': {'value': '/hello', 'type': 'string'},
      'http.query': {'value': {'msg': 'hello', 'userId': '123123123'}, 'type': 'object'},
      'http.body': {'value': {'msg': 'hello', 'userId': '123123123'}, 'type': 'object'}
    },
    'logs': []
  }, {
    'name': 'http-client',
    'timestamp': 1523863489207,
    'duration': 8,
    'context': {'traceId': '39560052a08deeb6', 'parentId': '87f7570d0e9edc64', 'spanId': '31e09f987bb89515'},
    'references': [{'traceId': '39560052a08deeb6', 'spanId': '87f7570d0e9edc64'}],
    'tags': {
      'http.query': {'value': {'msg': 'hello'}, 'type': 'object'},
      'http.method': {'value': 'GET', 'type': 'string'},
      'http.hostname': {'value': 'myapp.com', 'type': 'string'},
      'http.port': {'value': 80, 'type': 'number'},
      'http.path': {'value': '/?msg=hello', 'type': 'string'},
      'error': {'type': 'bool', 'value': false},
      'http.status_code': {'type': 'number', 'value': 200},
      'http.response': {
        'type': 'object',
        'value': {'_id': '123ABC', '_rev': '946B7D1C', 'username': 'pgte', 'email': 'pedro.teixeira@gmail.com'}
      },
      'http.response_size': {'type': 'number', 'value': 4}
    },
    'logs': []
  }, {
    'name': 'http-client',
    'timestamp': 1523863489217,
    'duration': 1,
    'context': {'traceId': '39560052a08deeb6', 'parentId': '31e09f987bb89515', 'spanId': '357274cb85d8e3bc'},
    'references': [{'traceId': '39560052a08deeb6', 'parentId': '87f7570d0e9edc64', 'spanId': '31e09f987bb89515'}],
    'tags': {
      'http.query': {'value': {}, 'type': 'object'},
      'http.method': {'value': 'POST', 'type': 'string'},
      'http.hostname': {'value': 'myapp.com', 'type': 'string'},
      'http.port': {'value': 80, 'type': 'number'},
      'http.path': {'value': '/', 'type': 'string'},
      'http.body': {'value': {'msg': 'hello'}, 'type': 'object'},
      'error': {'type': 'bool', 'value': false},
      'http.status_code': {'type': 'number', 'value': 200},
      'http.response': {
        'type': 'object',
        'value': {'_id': '123ABC', '_rev': '946B7D1C', 'username': 'pgte', 'email': 'pedro.teixeira@gmail.com'}
      },
      'http.response_size': {'type': 'number', 'value': 4}
    },
    'logs': []
  }],
  'status': 'normal',
  'traceId': '39560052a08deeb6',
  'name': 'HTTP-GET:/hello'
}
