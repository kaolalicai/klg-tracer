export const tracer = {
  'timestamp': 1525750246863,
  'duration': 13,
  'spans': [{
    'name': 'http',
    'timestamp': 1525750246864,
    'duration': 12,
    'context': {'traceId': '89c22e119bf1700d', 'spanId': '79cb683f5da95a39'},
    'references': [],
    'tags': {
      'http.method': {'value': 'GET', 'type': 'string'},
      'http.url': {'value': '/', 'type': 'string'},
      'http.client': {'value': false, 'type': 'bool'},
      'http.aborted': {'type': 'bool', 'value': false},
      'http.status_code': {'type': 'number', 'value': 200}
    },
    'logs': [{
      'fields': [{'key': 'query', 'value': {'aaa': 'test'}}, {'key': 'data', 'value': {'bbb': 'data'}}],
      'timestamp': 1525750246865
    }]
  }, {
    'name': 'http-client',
    'timestamp': 1525750246866,
    'duration': 8,
    'context': {'traceId': '89c22e119bf1700d', 'parentId': '79cb683f5da95a39', 'spanId': 'e6620a195d4ff431'},
    'references': [{'traceId': '89c22e119bf1700d', 'spanId': '79cb683f5da95a39'}],
    'tags': {
      'http.client': {'value': true, 'type': 'bool'},
      'http.method': {'value': 'GET', 'type': 'string'},
      'http.hostname': {'value': 'www.taobao.com', 'type': 'string'},
      'http.port': {'value': 443, 'type': 'string'},
      'http.path': {'value': '/?name=test', 'type': 'string'},
      'error': {'type': 'bool', 'value': false},
      'http.status_code': {'type': 'number', 'value': 200},
      'http.remote_ip': {'type': 'number', 'value': ''},
      'http.response_size': {'type': 'number', 'value': 21}
    },
    'logs': [{'fields': [{'key': 'response', 'value': 'Response from TaoBao.'}], 'timestamp': 1525750246874}]
  }],
  'status': 1,
  'traceId': '89c22e119bf1700d',
  'name': 'HTTP-GET:/'
}
