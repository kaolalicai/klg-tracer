import {wrap} from './FunctionUtil'
import * as tracer from 'tracer'

const logger = tracer.console({})
describe('logger ts test', async function () {
  it(' test wrap', async () => {
    const spy = jest.fn()
    wrap(logger, 'log', function (log) {
      return function (...args) {
        spy('高丹跪')
        return log.apply(this, args)
      }
    })
    logger.log('happy:', 2018)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('高丹跪')
  })
})
