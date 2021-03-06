# Parallel Computing (Hardware)

First of all, what exactly is "parallel computing"? Wikipedia defines it as 'a form of computation in which many calculations are carried out simultaneously, operating on the principle that large problems can often be divided into smaller ones, which are then solved concurrently ("in parallel")'. \[1]

Many different hardware architectures exist today that can perform a single task using multiple processors. Some examples, in order of decreasing scale are:

**Grid computing** - a combination of computer resources from multiple administrative domains applied to a common task.

**MPP (Massively Parallel Processor) systems** - known as the supercomputer architecture.

**Cluster server system** - a network of general-purpose computers.

**SMP (Symmetric Multiprocessing) system** - identical processors (grouped in powers of 2) connected together to act as one unit.

**Multi-core processor** - a single chip with numerous computing cores.

## _Flynn's Taxonomy_

Flynn's Taxonomy is a classification of computer architectures proposed by Michael J. Flynn \[2]. It is based on the concurrency of instruction and data streams available in the architecture. An instruction stream is the set of instructions that makes up a process, and a data stream is the set of data to be processed.

**1. Single Instruction, Single Data stream (SISD)**

SISD system is a sequential system where one instruction stream process one data stream. The pre-2004 PCs were of this type of system.

**Figure 1.2: SISD architecture**

![](<../.gitbook/assets/Screen_Shot_2021-12-20_at_8.03.42_AM.png>)

**2. Single Instruction, Multiple Data streams (SIMD)**

One instruction is broadcasted across many compute units, where each unit processes the same instruction on different data. The vector processor, a type of supercomputer, is an example of this type of architecture. Recently, various micro-processors include SIMD processors. For example, SSE/AVX instructions on Intel CPUs, and SPE instructions on Cell Broadband Engines perform SIMD operations.

**Figure 1.3: SIMD architecture**

![](<../.gitbook/assets/Screen_Shot_2021-12-20_at_8.02.36_AM.png>)

**3. Multiple Instruction, Single Data stream (MISD)**

Multiple instruction streams process a single data stream. Very few systems fit within this category, with the exception of fault tolerant systems.

**4. Multiple Instruction, Multiple Data streams (MIMD)**

Multiple processing units each process multiple data streams using multiple instruction streams.

**Figure 1.4: MIMD architecture**

![](<../.gitbook/assets/Screen_Shot_2021-12-20_at_8.05.16_AM.png>)

Using this classification scheme, most parallel computing hardware architectures, such as the SMP and cluster systems, fall within the MIMD category. For this reason, the MIMD architecture is further categorized by memory types.

The two main memory types used in parallel computing system are shared memory and distributed memory types. In shared memory type systems, each CPU that makes up the system is allowed access to the same memory space. In distributed memory type systems, each CPU that makes up the system uses a unique memory space.

Different memory types result in different data access methods. If each CPU is running a process, a system with shared memory type allows the two processes to communicate via read/write operations to the shared memory space. On the other hand, a system with distributed memory type requires data transfers to be explicitly performed by the user, since the two memory spaces are managed by two OS's.

The next sections explore the two parallel systems in detail.

**Figure 1.5: The two widely used parallel processing system types**

![](<../.gitbook/assets/Screen_Shot_2021-12-20_at_8.23.38_AM.png>)

## _Distributed Memory Type_

Tasks that take too long using one computer can be broken up to be performed in parallel using a network of processors. This is known as a cluster server system, which is perhaps the most commonly-seen distributed memory type system. This type of computing has been used for years in the HPC (High Performance Computing) field, which performs tasks such as large-scale simulations.

MPP (Massively Parallel Processor) system is also another commonly-seen distributed memory type system. It connects numerous nodes, which are made up of CPUs, memory, and a network port, connected via a specialized fast network. NEC's Earth Simulator and IBM's Blue Gene are some of the known MPP systems.

The main difference between a cluster system and a MPP system lies in the fact that a cluster does not use specialized hardware, giving it a much higher cost performance than the MPP systems. Due to this reason, many MPP systems, which used to be the leading supercomputer type, have been replaced by cluster systems. According to the TOP500 Supercomputer Sites \[3], of the top 500 supercomputers as of June 2009, 17.6% are MPP systems, while 82% are cluster systems.

**Figure 1.6: Architecture statistics from TOP500 Supercomputer Sites**

![](<../.gitbook/assets/Screen_Shot_2021-12-20_at_8.26.27_AM.png>)

One problem with cluster systems is the slow data transfer rates between the processors. This is due to the fact that these transfers occur via an external network. Some recent external networks include Myrinet, Infiniband, and 10Gbit Ethernet, which have become significantly faster compared to the traditional Gigabit Ethernet. However, even with these external networks, the transfer rates are still at least an order of magnitude slower than local memory access of each processor.

For the reason given above, cluster systems are suited for parallel algorithms where the CPUs do not have to communicate with each other too often. These types of algorithms are said to be "coarse-grained parallel". These algorithms are used often in simulations where many trials are required, but these trials do not depend on each other. An example of this is risk simulation used for the development of derivative products in the field of finance**.**

## _Shared Memory Type_

In shared memory type systems, all processors share the same address space, allowing these processors to communicate with each other through read/writes to shared memory. Since data transfers/collections are unnecessary, this results in a much simpler system from the software perspective.

An example of a shared memory type system is the Symmetric Multiprocessing (SMP) system (**Figure 1.7**, left/\[4]). The Intel Multiprocessor Specification Version 1.0 released back in 1994 describes the method for using x86 processors in a multi-processor configuration. 2-way workstations (where up to 2 CPUs can be installed) are commonly seen today \[5]. However, increasing the number of processors naturally increases the number of accesses to the memory, making the bandwidth between the processors and the shared memory a bottleneck. SMP systems are thus not scalable, and only effective up to a certain number of processors. Although 2-way servers are inexpensive and common, 32-way or 64-way SMP servers require specialized hardware, which can become expensive.

**Figure 1.7: SMP and NUMA**

![](<../.gitbook/assets/Screen_Shot_2021-12-20_at_8.28.21_AM.png>)

Another example of a shared memory type system is the Non-Uniform Memory Access (NUMA) system. The main difference from a SMP system is that the physical distance between the processor and the memory changes the access speeds. By prioritizing the usage of physically closer memory (local memory) over more distant memory (remote memory), the bottleneck in SMP systems can be minimized. To reduce the access cost to remote memory, a processor cache and a specialized hardware making sure the cache data is coherent has been added, and this system is known as a Cash Coherent NUMA (cc-NUMA).

Server CPUs such as AMD Opteron and Intel Xeon 5500 Series contain on-chip memory controllers. Thus, when these are used in multi-processor configurations, they become a NUMA system. The hardware to verify cache coherency is embedded into the CPU. In addition, NUMA replaces the Front Side Bus (FSB), which is a bus that connects multiple CPUs as well as other chipsets together, with an interconnect port that uses a point-to-point protocol. These ports are called Quick Path Interconnect (QPI) by Intel, and Hyper Transport by AMD.

Now that the basic concepts of SMP and NUMA are covered, let us look at an interesting fact of typical x86 server products. Dual-core and quad-core processors are SMP systems, since the processor cores all access the same memory space. Networking these multi-core processors actually end up creating a NUMA system. In other words, the mainstream 2-way or more x86 server products are "NUMA systems made from SMP systems" (**Figure 1.8**).

**Figure 1.8: Typical 2-way x86 server**

![](<../.gitbook/assets/Screen_Shot_2021-12-20_at_8.30.59_AM.png>)

## _Accelerator_

The parallel processing systems discussed in the previous sections are all made by connecting generic CPUs. Although this is an intuitive solution, another approach is to use as co-processor different hardware more suited for performing certain tasks. The non-CPU hardware in this configuration is known as an "accelerator".

**Figure 1.9: Example of accelerators**

![](<../.gitbook/assets/Screen_Shot_2021-12-20_at_8.33.04_AM.png>)

Some popular accelerators include the Cell Broadband Engine (Cell/B.E.) and GPUs. Accelerators typically contain cores optimized for performing floating-point arithmetic (or fixed-point arithmetic for some DSPs). Since these cores are relatively simple and thus do not take much space on the chip, numerous cores are typically available.

For example, the Cell/B.E. contains 1 PowerPC Processor Element (PPE), which is suited for processes requiring frequent thread switching, and 8 Synergistic Processor Elements (SPE) which are cores optimized for floating-point arithmetic. These 9 cores are connected using a high-speed bus called the Element Interconnect Bus (EIB), and placed on a single chip**.**

**Figure 1.10: Architecture of the Cell Broadband Engine**

![](<../.gitbook/assets/Screen_Shot_2021-12-20_at_8.34.06_AM_(1).png>)

Another example is NVIDIA's Tesla M2000, which is based on a GPU architecture known as Fermi. This chip contains 16 sets of 32-core Streaming Processors (SM), for a total of 512 cores on one chip.

**Figure 1.11: NVIDIA Fermi architecture**

![](<../.gitbook/assets/Screen_Shot_2021-12-20_at_8.35.39_AM.png>)

In recent years, these accelerators have been attracting a lot of attention. This is mainly due to t he fact that the floating-point arithmetic capability of generic CPUs has leveled off at around 10 GFLOPS, while the Cell/B.E. and GPUs can perform between 100 GFLOPS and 1 TFLOPS for a relatively low price. They are also "greener", making them a better option than cluster server systems, as many factories and research labs are trying to cut back on power usage.

For example, the circuit board and semiconductor fields use automatic visual inspection. The tests increase in number and complexity every year, requiring faster image processing so that the rate of production is not compromised. Medical imaging devices such as ultrasonic diagnosing devices and CT scanners are producing every year higher and higher quality 2-D images as output, and generic CPUs are not capable of processing the images in a practical amount of time. Using a cluster server for these tasks requires a vast amount of space, as well as high power usage. Thus, the accelerators provide a portable and energy-efficient alternative to the cluster. These accelerators are typically used in conjunction with generic CPUs, creating what is known as a "hybrid system".

**Figure 1.12: Hybrid system**

![](<../.gitbook/assets/Screen_Shot_2021-12-20_at_8.36.30_AM.png>)

In summary, an accelerator allows for a low-cost, low-powered, and high-performance system. However, the transfer speed between the host CPU and the accelerator can become a bottleneck, making it unfit for applications requiring frequent I/O operations. Thus, the decision to use a hybrid system, as well as what type of hybrid system, needs to be made wisely.

OpenCL, in brief, is a development framework to write applications that runs on these "hybrid systems".
