import Workload from './workload';
import { getSecondsDiff } from '@shell/utils/time';

export default class Job extends Workload {
  get duration() {
    const { completionTime, startTime } = this.status;
    let seconds = 0;

    if (startTime) {
      seconds = getSecondsDiff(startTime, completionTime || new Date());
    }

    return seconds;
  }
}
