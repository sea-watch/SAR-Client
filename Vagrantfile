# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/xenial64"

  config.vm.network "forwarded_port", guest: 5984, host: 5984

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "512"
  end

  config.vm.provision 'shell', path: 'script/vagrant-provision.sh'
end
