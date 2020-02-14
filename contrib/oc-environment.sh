# This file is an example of how you might set up your environment to
# run the tectonic console against OpenShift during development. To use it for running
# bridge, do
#
# . contrib/oc-environment.sh
# ./bin/bridge
#

# You'll need a working oc logged in, and you'll need jq installed and in your
# path for this script to work correctly.

# The environment variables beginning with "BRIDGE_" act just like
# bridge command line arguments - in fact. to get more information
# about any of them, you can run ./bin/bridge --help

export BRIDGE_USER_AUTH="disabled"
export BRIDGE_K8S_MODE="off-cluster"
export BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(oc whoami --show-server)
export BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
export BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS=$(oc -n openshift-monitoring get configmap sharing-config -o jsonpath='{.data.thanosURL}')
export BRIDGE_K8S_MODE_OFF_CLUSTER_PROMETHEUS=$(oc -n openshift-monitoring get configmap sharing-config -o jsonpath='{.data.prometheusURL}')
export BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER=$(oc -n openshift-monitoring get configmap sharing-config -o jsonpath='{.data.alertmanagerURL}')
export BRIDGE_K8S_MODE_OFF_CLUSTER_MCM="https://rawagner-api-2-kube-system.apps.ocp-edge-cluster-cdv.qe.lab.redhat.com"
export BRIDGE_K8S_MODE_OFF_CLUSTER_MCM_SEARCH="https://rawagner-search-kube-system.apps.ocp-edge-cluster-cdv.qe.lab.redhat.com"
export BRIDGE_K8S_MODE_OFF_CLUSTER_MCM_TOKEN="d8621ec142cd123bbc3028a6a239cdb487fcc42975a54218de6813acb2f8235828473f21f3cdfdab720e8bea93abf60c9709ea36e99890da7c5c67ee7a5fceb73c4c6cdc3ba4b139d97f0bce09b2fa3f564dbb129b78fa03ac6d9749e1c45f706fc7c6a6c988e275c5b2b024d1801c727146637485e62a4631b9ae5cd7e9613710d5f7bf360d409dbf8c47f67ac94f06e13edfc2548f31e252fe8f8c9c4e01f91134fc209a85285860d32efa414d886ce9fc12e1589af40bbe4255ca202242ce22a4c088fe5d42807b21ff9ebfafd110d25884845a494567608746d1c43c6321aff5ab6591d2616a6622ee85b7b7a8d932f8e8aca308be6166470840a013232cbc2f431b8f89532cd8843fd77fb67df8a2cd9ed113e6c391007cfb5db0914525e73b9b705619913c482aac8a425fce15ac76c40cf86bc60779289792e79dee17d05c1e55144045990abe55ce8b7a6123a2c3ef1075c29e14b302ab9e4de25f779a7a2942abaefb91218e6eb1fbec9e9b747f4e94fcf298a3f2ffdb1ec4dc278ca6e0018e119a1ba1bc28c10d1ccaba43e1b641d5dcb21c9c43064e68b9538485375d6739b13506a3da4725a3f71a938f95b75f96fae867bdbc7b48f20f782e780bbf8270f7f3465f4cf008bbb19660ba510972be487c07551a95519914d699be1f844f13214e5b7fc9531b7ac83a406f5a0c02d206bafa1266d332fa59d9da87"
export BRIDGE_K8S_AUTH="bearer-token"
export BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc whoami --show-token)

echo "Using $BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT"
