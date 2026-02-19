import { getLogger } from '../utils/logging'
import { foundationRequest } from './foundation-client'

const logger = getLogger('communications-api')

export interface HostRegistrationData {
  full_name: string
  email: string
  phone: string
  activity_type: string
  number_of_experiences: string
  message: string
}

interface CommsResponse {
  success: boolean
  message: string
}

export const communicationsApi = {
  subscribeNewsletter: async (email: string): Promise<CommsResponse> => {
    logger.info('Subscribing to newsletter', { email })

    const response = await foundationRequest<CommsResponse>('/api/comms/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })

    logger.info('Newsletter subscription successful')
    return response
  },

  submitHostRegistration: async (data: HostRegistrationData): Promise<CommsResponse> => {
    logger.info('Submitting host registration', { name: data.full_name })

    const response = await foundationRequest<CommsResponse>('/api/comms/contact/host-registration', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    logger.info('Host registration submitted')
    return response
  },
}
