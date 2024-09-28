import moment from 'moment'

export function formatTime(time: number) {
  return (
    `${moment(time).hours().toString().padStart(2, '0')
    }:${
      moment(time).minutes().toString().padStart(2, '0')
    }:00`
  )
}
