import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMicrochip,
  faVideo,
  faMemory,
  faServer,
  faBolt,
  faBox,
  faHardDrive,
  faKeyboard,
  faDisplay,
  faCircleQuestion,
} from '@fortawesome/free-solid-svg-icons'

const icons = {
  CPU: faMicrochip,
  GPU: faVideo,
  RAM: faMemory,
  PLACA_MAE: faServer,
  FONTE: faBolt,
  GABINETE: faBox,
  ARMAZENAMENTO: faHardDrive,
  PERIFERICO: faKeyboard,
}

export default function CategoriaIcon({ categoria, nome, className = 'h-5 w-5' }) {
  let icon = icons[categoria] || faCircleQuestion
  if (categoria === 'PERIFERICO' && nome && nome.startsWith('Monitor')) {
    icon = faDisplay
  }
  return <FontAwesomeIcon icon={icon} className={className} />
}
