export enum ServicePort {
  ACCOUNT = 3000,
  AUTH = 3001,
  GATEWAY = 3002,
}

export enum ServiceProtoPath {
  ACCOUNT = '../../SDK/grpc/account',
  AUTH = '../../SDK/grpc/auth',
}

export enum AppState {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
}

export enum TerminationSignal {
  SIGINT = 'SIGINT',
  SIGTERM = 'SIGTERM',
  SIGHUP = 'SIGHUP',
}

export enum ClusterSignal {
  EXIT = 'exit',
}
