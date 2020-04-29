const PROTO_PATH = __dirname + '/cli-plugin.proto';
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const health = require('grpc-health-check');

const { exec } = require('./plugin');

const goPluginVersion = '1'
const appProtocolVersion = '1'
const pluginHost = '0.0.0.0'
const pluginPort = '50052'

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

const definition = grpc.loadPackageDefinition(packageDefinition).protoDef;


function getServer() {
    var server = new grpc.Server();

    server.addService(definition.CLI.service, {
        Exec: exec,
    });

    return server;
}

const statusMap = {
  "CLI": proto.grpc.health.v1.HealthCheckResponse.ServingStatus.SERVING,
  "": proto.grpc.health.v1.HealthCheckResponse.ServingStatus.NOT_SERVING,
};

let healthImpl = new health.Implementation(statusMap);

const routeServer = getServer();
routeServer.addService(health.service, healthImpl);
routeServer.bind(`${pluginHost}:${pluginPort}`, grpc.ServerCredentials.createInsecure());
routeServer.start();

// Perform handshake with plugin host
console.log(`${goPluginVersion}|${appProtocolVersion}|tcp|${pluginHost}:${pluginPort}|grpc`)